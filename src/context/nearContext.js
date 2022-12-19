// near api js
import { providers } from "near-api-js";
import { map, distinctUntilChanged } from "rxjs";
// wallet selector UI
import "@near-wallet-selector/modal-ui/styles.css";
import { setupModal } from "@near-wallet-selector/modal-ui";
import LedgerIconUrl from "@near-wallet-selector/ledger/assets/ledger-icon.png";
import MyNearIconUrl from "@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png";
import { setupSender } from "@near-wallet-selector/sender";
// wallet selector options
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
const NearContext = createContext();

const CONTRACT_ID = "ft.nekocoin.testnet";
export function NearWrapper({ children }) {
	const [selector, setSelector] = useState(null);
	const [modal, setModal] = useState(null);
	const [accounts, setAccounts] = useState([]);
	const [wallet, setWallet] = useState(null);
	const init = useCallback(async () => {
		const _selector = await setupWalletSelector({
			network: "testnet",
			modules: [
				setupMyNearWallet({ iconUrl: MyNearIconUrl }),
				setupLedger({ iconUrl: LedgerIconUrl }),
				setupSender(),
				setupMeteorWallet(),
				setupCoin98Wallet(),
			],
		});
		const _modal = setupModal(_selector, {
			contractId: CONTRACT_ID,
			description: "Please select a wallet to sign in.",
		});
		const state = _selector.store.getState();

		setAccounts(state.accounts);
		//check is browser wallet

		window.selector = _selector;

		window.modal = _modal;

		setSelector(_selector);
		setModal(_modal);
	}, []);

	useEffect(() => {
		init().catch((err) => {
			console.error(err);
			alert("Failed to initialise wallet selector");
		});
	}, [init]);
	useEffect(() => {
		if (!selector) {
			return;
		}

		const subscription = selector.store.observable
			.pipe(
				map((state) => state.accounts),
				distinctUntilChanged()
			)
			.subscribe((nextAccounts) => {
				console.log("Accounts Update", nextAccounts);
				selector
					.wallet()
					.then((res) => {
						setWallet(res);
					})
					.catch((e) => {
						console.log(e);
					});
				setAccounts(nextAccounts);
			});

		return () => subscription.unsubscribe();
	}, [selector]);
	if (!selector || !modal) {
		return null;
	}
	const accountId = accounts.find((account) => account.active)?.accountId || null;
	async function viewMethod(contractId, methodName, args) {
		const { network } = selector.options;
		const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
		const res = await provider.query({
			request_type: "call_function",
			account_id: contractId,
			method_name: methodName,
			args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
			finality: "optimistic",
		});

		return JSON.parse(Buffer.from(res.result).toString());
	}
	async function signOut() {
		const _wallet = await selector.wallet();
		_wallet.signOut().catch((err) => {
			console.log("Failed to sign out");
			console.error(err);
		});
	}
	async function callMethods(params, metadata, callbackUrl) {
		if (!accountId) {
			toast.warn("Please connect wallet");
			throw new Error("ERR_NOT_SIGNED_IN");
		}
		const { contract } = selector.store.getState();
		const wallet = await selector.wallet();

		const transactions = [];
		for (const param of params) {
			transactions.push({
				signerId: accountId,
				receiverId: param.contractId || contract.contractId,
				actions: [
					{
						type: "FunctionCall",
						params: {
							methodName: param.methodName || "add_message",
							args: param.args || { message: "Hello World" },
							gas: param.gas ? param.gas : "250000000000000",
							deposit: param.amount ? param.amount.toString() : "0",
						},
					},
				],
			});
		}

		const res = await wallet
			.signAndSendTransactions({ transactions, metadata: JSON.stringify(metadata), callbackUrl: callbackUrl || "" })
			.catch((err) => {
				throw err;
			});
		return res;
	}
	const sharedState = {
		selector,
		modal,
		wallet,
		accounts,
		accountId,
		CONTRACT_ID,
		viewMethod,
		callMethods,
		signOut,
	};
	return <NearContext.Provider value={sharedState}>{children}</NearContext.Provider>;
}

export function useNearContext() {
	return useContext(NearContext);
}

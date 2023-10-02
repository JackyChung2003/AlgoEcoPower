from pyteal import *
import user_wallet

router = Router(
    "Trading Sidechain",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),
        opt_in=OnCompleteAction.call_only(Approve()),
        close_out=OnCompleteAction.call_only(Approve()),
    ),
    clear_state=Approve(),
)


@router.method
def paymentToBuy(
    payment: abi.PaymentTransaction, price: abi.Uint64, amount_purchase: abi.Uint64
):  # This is a transaction type, and we assigning that value to the payment argument
    return Seq(
        # Check whether the account that is calling the pay method has opted into the smart contract
        Assert(App.optedIn(Txn.sender(), Global.current_application_id())),
        # Check whether the amount of the payment is equal to the price of the asset
        Assert(payment.get().amount() == price.get()),
        # Check whether the receiver of the payment is the smart contract itself
        Assert(payment.get().receiver() == Global.current_application_address()),
        # Store the sender of the transaction in the global state
        App.globalPut(Bytes("Buyer"), payment.get().sender()),
        App.localPut(Txn.sender(), Bytes("paid"), Bytes("True")),
        App.localPut(Txn.sender(), Bytes("amount_purchase"), amount_purchase.get()),
        user_wallet.deleteUploadEnergy(amount_purchase),
        Approve(),
    )


@router.method
def confirmPayment(*, output: abi.String):
    paid_state = App.localGet(Txn.sender(), Bytes("paid"))
    amount_to_load = App.localGet(
        Txn.sender(), Bytes("amount_purchase")
    )  # Read the local state of the sender of this transaction

    return Seq(
        Assert(paid_state == Bytes("True")),
        # Going to assert whether this pay state is equal to true
        # add the amount to the local state of the buyer (unsure)
        # App.localPut(App.globalGet(Bytes("Buyer")), Bytes("total_amount"), amount_to_load),  # Read the global state of the buyer and add the amount to the local state of the buyer
        # add the amount to the local state of the buyer
        App.localPut(
            App.globalGet(Bytes("Buyer")), Bytes("energy_purchase"), amount_to_load
        ),
        output.set(paid_state),
    )


@router.method
def payToOwner(receiver: abi.Account, amount: abi.Uint64, *, output: abi.Address):
    return Seq(
        InnerTxnBuilder.Execute(  # Inner transaction bulder is basically a transaction that is send by smart contract
            {
                TxnField.type_enum: TxnType.Payment,  # Executing payment transaction
                TxnField.amount: amount.get(),  # payment ammount is the amound we defind above in the variable
                TxnField.receiver: receiver.address(),  # the receiver value is taken from argument receiver we passed in,
            }
        ),
        output.set(receiver.address()),  # To see what receiver address return
    )


if __name__ == "__main__":
    import os
    import json

    path = os.path.dirname(os.path.abspath(__file__))
    approval, clear, contract = router.compile_program(version=8)

    # Specify the directory path
    directory_path = os.path.join(path, "artifacts")

    # Create the directory if it doesn't exist
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

    # Dump out the contract as json that can be read in by any of the SDKs
    with open(os.path.join(path, "artifacts/contract.json"), "w") as f:
        f.write(json.dumps(contract.dictify(), indent=2))

    # Write out the approval and clear programs
    with open(os.path.join(path, "artifacts/approval.teal"), "w") as f:
        f.write(approval)

    with open(os.path.join(path, "artifacts/clear.teal"), "w") as f:
        f.write(clear)

from pyteal import *

router = Router(
    "my-first-router",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),  # To create transaction
        opt_in=OnCompleteAction.call_only(
            Approve()
        ),  # Triggered for non-create application call
        close_out=OnCompleteAction.call_only(
            Approve()
        ),  # Triggered for non-create application call
        update_application=OnCompleteAction.never(),  # Always reject the transaction(make it not updatable)
        delete_application=OnCompleteAction.never(),  # Always reject the transaction(make it not deletable)
    ),
    clear_state=Approve(),
)

# Global state variables
producer_balances = App.localPut(Int(0), Int(0))
consumer_balances = App.localPut(Int(1), Int(0))
energy_price = Int(10)


# Energy Trading
@router.method
def record_production(energy_produced: Int):
    producer_address = App.localGet(Int(0), App.sender())
    producer_balance = App.localGet(Int(0), producer_address)
    new_balance = producer_balance + energy_produced
    App.localPut(Int(0), producer_address, new_balance)


@router.method
def record_consumption(energy_consumed: Int):
    consumer_address = App.localGet(Int(1), App.sender())
    consumer_balance = App.localGet(Int(1), consumer_address)
    new_balance = consumer_balance + energy_consumed
    App.localPut(Int(1), consumer_address, new_balance)


@router.method
def trade_energy(energy_amount: Int, seller_address: addr):
    # Ensure the seller has enough energy to sell
    seller_balance = App.localGet(Int(0), seller_address)
    Assert(seller_balance >= energy_amount)

    # Calculate the total cost based on the energy price
    total_cost = energy_price * energy_amount

    # Ensure the buyer has enough funds to purchase the energy
    buyer_balance = App.localGet(Int(1), App.sender())
    Assert(buyer_balance >= total_cost)

    # Update balances for both parties
    new_seller_balance = seller_balance - energy_amount
    new_buyer_balance = buyer_balance - total_cost

    App.localPut(Int(0), seller_address, new_seller_balance)
    App.localPut(Int(1), App.sender(), new_buyer_balance)


@router.method
def set_energy_price(new_price: Int):
    # Only allow the contract creator to update the price
    Assert(App.creator() == Global.current_application_address())
    App.localPut(Int(2), Int(0), new_price)


# Compile the contract
if __name__ == "__main__":
    import os
    import json

    path = os.path.dirname(os.path.abspath(__file__))
    approval, clear, contract = router.compile_program(version=8)

    # Dump out the contract as json that can be read in by any of the SDKs
    with open(os.path.join(path, "artifacts/contract.json"), "w") as f:
        f.write(json.dumps(contract.dictify(), indent=2))

    # Write out the approval and clear programs
    with open(os.path.join(path, "artifacts/approval.teal"), "w") as f:
        f.write(approval)

    with open(os.path.join(path, "artifacts/clear.teal"), "w") as f:
        f.write(clear)

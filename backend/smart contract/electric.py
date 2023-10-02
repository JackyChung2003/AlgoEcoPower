#not in use

from pyteal import *

router = Router(
    "electric-trading",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),  # To create transaction
        opt_in=OnCompleteAction.call_only(
            Approve()
        ),  # Triggered for non-create application call
        close_out=OnCompleteAction.call_only(
            Approve()
        ),  # Triggered for both create and non-create application call(usually will just use call_only)
        update_application=OnCompleteAction.never(),  # Always reject the transaction(make it not updatable)
        delete_application=OnCompleteAction.never(),  # Always reject the transaction(make it not deletable)
    ),
    clear_state=Approve(),
)

# Define token IDs
currency_token = Bytes("currency")  # Currency token ID
energy_token = Bytes("energy")  # Energy token ID

App.localPut(Txn.sender(), currency_token, Int(0))
App.localPut(Txn.sender(), energy_token, Int(0))

# Define trading conditions
max_energy_tokens = Int(2000)


@router.method
def energy_trading():
    # Check if the user's wallet has been initialized
    wallet_initialized = App.localGet(Txn.sender(), currency_token) != Int(0)

    # Initialize the user's wallet with currency and energy tokens (if not already initialized)
    handle_creation = Seq(
        [
            If(Not(wallet_initialized)).Then(
                App.localPut(
                    Txn.sender(), currency_token, Int(10)
                ),  # Initialize user's currency balance (e.g., 100)
                App.localPut(
                    Txn.sender(), energy_token, Int(0)
                ),  # Initialize user's energy balance (e.g., 0)
            ),
            Return(Int(1)),
        ]
    )

    # Trade function
    on_trade = Seq(
        [
            # Check if the user has enough currency tokens for the trade
            If(App.localGet(Txn.sender(), currency_token) < Int(10))
            .Then(
                Return(
                    Int(0)
                ),  # Reject the trade if the user doesn't have enough currency
            )
            # Check if the user has not exceeded the maximum energy token limit
            .ElseIf(
                App.localGet(Txn.sender(), energy_token) + Int(1) > max_energy_tokens
            )
            .Then(
                Return(Int(0)),  # Reject the trade if the limit is exceeded
            )
            .Else(
                # Execute the trade
                App.localPut(
                    Txn.sender(),
                    currency_token,
                    (
                        App.localGet(Txn.sender(), currency_token)
                        - 
                    ),
                ),  # decreased by the amount specified in the application ID
                App.localPut(
                    Txn.sender(),
                    energy_token,
                    App.localGet(Txn.sender(), energy_token) + Int(1),
                ),
                Return(Int(1)),
            )
        ]
    )

    return Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.application_id() != Int(0), on_trade],
    )


def clear_state_program():
    program = Return(Int(1))
    return compileTeal(program, Mode.Application, version=5)


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

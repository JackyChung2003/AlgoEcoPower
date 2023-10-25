from pyteal import *

"""AlgoEcoPower Application Smart Contract"""

# 1 Algos = 1,000,000 microAlgos 

CURRENCY = Bytes("amount")                  # Local variable to keep track of amount of currency owned by account
ENERGY = Bytes("energy")                    # Local variable to keep track of energy owned by account
ENERGY_THRESHOLD = Bytes("energy_threshold") # Global variable to keep track of energy threshold

ENERGY_PURCHASE = Bytes("energy_purchase")  # Global variable to keep track of energy purchases
ENERGY_UPLOAD = Bytes("energy_upload")      # Global variable to keep track of energy uploads
ENERGY_UPLOAD_PRICE = Bytes("energy_upload_price")      # Global variable to keep track of energy uploads
ENERGY_UPLOAD_SOLD = Bytes("energy_upload_sold")      # Global variable to keep track of energy uploads
ENERGY_UPLOAD_REMAIN = Bytes("energy_upload_remain")      # Global variable to keep track of energy uploads

ENERGY_BALANCE = Bytes("energy_balance")      # Local variable to keep track of energy balance(energy produced + energy purchased)
SELLER_1_ENERGY = Bytes("seller_1_upload_energy")   
SELLER_2_ENERGY = Bytes("seller_2_upload_energy")
SELLER_3_ENERGY = Bytes("seller_3_upload_energy")

# for update total energy user have at the moment
scratchCurrency = ScratchVar(TealType.uint64)
scratchEnergyProduced =  ScratchVar(TealType.uint64)
scratchEnergyPurchased =  ScratchVar(TealType.uint64)
scratchEnergyUploadCount = ScratchVar(TealType.uint64)
scratchEnergyThreshold = ScratchVar(TealType.uint64)

scratchEnergyUploadSold = ScratchVar(TealType.uint64)
scratchEnergyUploadRemain = ScratchVar(TealType.uint64)

scratchEnergyUploadPrice = ScratchVar(TealType.uint64)
scratchEnergyCount = ScratchVar(TealType.uint64)

scratchAmountChange = ScratchVar(TealType.uint64)
scratchSellerEnergy = ScratchVar(TealType.uint64)
scratchFinalPurchasePrice = ScratchVar(TealType.uint64)

def upload_energy():
    return Seq([
        scratchEnergyUploadCount.store(App.globalGet(ENERGY_UPLOAD)),               # Get the energy upload in global storage
        scratchEnergyCount.store(App.localGet(Txn.sender(), ENERGY)),               # Get the energy produced in local storage
        scratchEnergyUploadRemain.store(App.globalGet(ENERGY_UPLOAD_REMAIN)),       # Get the energy upload remain in global storage
        # Check if the user has enough energy to upload
        If(scratchEnergyCount.load() >= Btoi(Txn.application_args[1]) * Int(100)).Then(
            App.globalPut(ENERGY_UPLOAD, scratchEnergyUploadCount.load() + (Btoi(Txn.application_args[1])* Int(100))),              # Update the uploaded energy in global storage
            App.localPut(Txn.sender(), ENERGY, scratchEnergyCount.load() - (Btoi(Txn.application_args[1])* Int(100))),              # Update the current energy in local storage
            App.globalPut(ENERGY_UPLOAD_REMAIN, scratchEnergyUploadRemain.load() + (Btoi(Txn.application_args[1])* Int(100))),      # Update the uploaded energy remain in global storage,   
            App.globalPut(ENERGY_UPLOAD_PRICE, Btoi(Txn.application_args[2])),                                                      # Update the uploaded energy price in global storage
            Return(Int(1))  # Return success
        ).Else(
            Return(Int(0))  # Return failure
        )
    ])

def set_threshold():
    return Seq([
        scratchEnergyUploadCount.store(App.globalGet(ENERGY_UPLOAD)),               # Get the energy upload in global storage
        scratchEnergyCount.store(App.localGet(Txn.sender(), ENERGY)),               # Get the energy produced in local storage
        scratchEnergyUploadRemain.store(App.globalGet(ENERGY_UPLOAD_REMAIN)),       # Get the energy upload remain in global storage

        App.localPut(Txn.sender(), ENERGY_THRESHOLD, Btoi(Txn.application_args[1])),  # Update the energy threshold in local storage

        If(scratchEnergyCount.load() > (Btoi(Txn.application_args[1]) * (Btoi(Txn.application_args[2])))).Then(
            App.globalPut(ENERGY_UPLOAD, scratchEnergyUploadCount.load() + scratchEnergyCount.load() - (Btoi(Txn.application_args[1]) * (Btoi(Txn.application_args[2])))),              # Update the uploaded energy in global storage
            App.localPut(Txn.sender(), ENERGY, (Btoi(Txn.application_args[1]) * (Btoi(Txn.application_args[2])))),                                                                      # Update the current energy
            App.globalPut(ENERGY_UPLOAD_REMAIN, scratchEnergyUploadRemain.load() + scratchEnergyCount.load() - (Btoi(Txn.application_args[1]) * (Btoi(Txn.application_args[2])))),      # Update the uploaded energy remain in global storage,   
            Return(Int(1))
        ).Else(
            Return(Int(0))
        )
    ])

def purchase_energy_seller_1():
    return Seq([
        scratchSellerEnergy.store(App.globalGet(SELLER_1_ENERGY)),                  # Get the seller energy upload in global storage
        scratchCurrency.store(App.localGet(Txn.sender(), CURRENCY)),                # Get the currency in local storage
        scratchEnergyPurchased.store(App.globalGet(ENERGY_PURCHASE)),               # Get the energy purchased in global storage

        #calculate final purchase price
        scratchFinalPurchasePrice.store((Btoi(Txn.application_args[1])*Int(100)) * Btoi(Txn.application_args[2])), # final purchase price = energy amount * price per amount

        # Check if the user has enough money to purchase
        If(scratchCurrency.load() >= scratchFinalPurchasePrice.load()).Then(
            App.globalPut(SELLER_1_ENERGY, scratchSellerEnergy.load() - (Btoi(Txn.application_args[1])*Int(100))),      # Update the current seller energy uploaded in global storage
            App.localPut(Txn.sender(), CURRENCY, scratchCurrency.load() - scratchFinalPurchasePrice.load()),            # Update the current energy in local storage
            App.globalPut(ENERGY_PURCHASE, scratchEnergyPurchased.load() + (Btoi(Txn.application_args[1])*Int(100))),   # Update the energy purchase in global storage
            update_total_energy(), 
            Return(Int(1)),  # Return success
        ).Else(
            Return(Int(0))  # Return failure
        )
    ])

def purchase_energy_seller_2():
    return Seq([
        scratchSellerEnergy.store(App.globalGet(SELLER_2_ENERGY)),       # Get the seller energy upload in global storage
        scratchCurrency.store(App.localGet(Txn.sender(), CURRENCY)),     # Get the currency in local storage
        scratchEnergyPurchased.store(App.globalGet(ENERGY_PURCHASE)),    # Get the energy purchased in global storage
        
        #calculate final purchase price
        scratchFinalPurchasePrice.store((Btoi(Txn.application_args[1])*Int(100)) * Btoi(Txn.application_args[2])), # final purchase price = energy amount * price per amount
        
        # Check if the user has enough money to purchase
        If(scratchCurrency.load() >= scratchFinalPurchasePrice.load()).Then(
            App.globalPut(SELLER_2_ENERGY, scratchSellerEnergy.load() - (Btoi(Txn.application_args[1])*Int(100))),                  # Update the current seller energy uploaded in global storage
            App.localPut(Txn.sender(), CURRENCY, scratchCurrency.load() - scratchFinalPurchasePrice.load()),                        # Update the current energy in local storage
            App.globalPut(ENERGY_PURCHASE, scratchEnergyPurchased.load() + (Btoi(Txn.application_args[1])*Int(100))),               # Update the energy purchase in global storage
            update_total_energy(),
            Return(Int(1)),  # Return success
        ).Else(
            Return(Int(0))  # Return failure
        )
    ])

def purchase_energy_seller_3():
    return Seq([
        scratchSellerEnergy.store(App.globalGet(SELLER_3_ENERGY)),      # Get the seller energy upload in global storage
        scratchCurrency.store(App.localGet(Txn.sender(), CURRENCY)),    # Get the currency in local storage
        scratchEnergyPurchased.store(App.globalGet(ENERGY_PURCHASE)),   # Get the energy purchased in global storage
        
        #calculate final purchase price
        scratchFinalPurchasePrice.store((Btoi(Txn.application_args[1])*Int(100)) * Btoi(Txn.application_args[2])), # final purchase price = energy amount * price per amount
        
        # Check if the user has enough money to purchase
        If(scratchCurrency.load() >= scratchFinalPurchasePrice.load()).Then(
            App.globalPut(SELLER_3_ENERGY, scratchSellerEnergy.load() - (Btoi(Txn.application_args[1])*Int(100))),          # Update the current seller energy uploaded in global storage
            App.localPut(Txn.sender(), CURRENCY, scratchCurrency.load() - scratchFinalPurchasePrice.load()),                # Update the current energy in local storage
            App.globalPut(ENERGY_PURCHASE, scratchEnergyPurchased.load() + (Btoi(Txn.application_args[1])*Int(100))),       # Update the energy purchase in global storage
            update_total_energy(),
            Return(Int(1)),  # Return success
        ).Else(
            Return(Int(0))  # Return failure
        )
    ])

# to refresh total energy user have at the moment
def update_total_energy():
    return Seq([
        scratchEnergyProduced.store(App.localGet(Txn.sender(),ENERGY)),                                         # Get the energy produced in local storage
        scratchEnergyPurchased.store(App.globalGet(ENERGY_PURCHASE)),                                           # Get the energy purchased in global storage
        App.localPut(Txn.sender(),ENERGY_BALANCE,scratchEnergyProduced.load()+scratchEnergyPurchased.load()),   # Update the energy balance in local storage
        Return(Int(1))
    ])

# to edit the price of energy upload by user
def edit_energy_upload_price():
    return Seq([
        scratchEnergyUploadPrice.store(App.globalGet(ENERGY_UPLOAD_PRICE)),       # Get the energy upload in global storage
        # modify user input price
        scratchEnergyUploadPrice.store(Btoi(Txn.application_args[1])),
        App.globalPut(ENERGY_UPLOAD_PRICE, scratchEnergyUploadPrice.load()),  # Update the uploaded energy price in global storage
        Return(Int(1))
    ])  

# Only if want to take argument from user
# to retrive the upload energy back to account(upload energy-> purchase energy)
def retrieve_energy_upload():
    return Seq([
        scratchEnergyUploadCount.store(App.globalGet(ENERGY_UPLOAD)),       # Get the energy upload in global storage
        scratchEnergyPurchased.store(App.globalGet(ENERGY_PURCHASE)),      # Get the energy purchased in global storage
        scratchEnergyUploadRemain.store(App.globalGet(ENERGY_UPLOAD_REMAIN)),      # Get the energy remain in global storage
        # Check if the user has enough energy to upload
        If(scratchEnergyUploadRemain.load() >= (Btoi(Txn.application_args[1]) * Int(100))).Then(
            App.globalPut(ENERGY_UPLOAD_REMAIN, scratchEnergyUploadRemain.load() - (Btoi(Txn.application_args[1]) * Int(100))),  # Update the uploaded energy in global storage
            App.globalPut(ENERGY_UPLOAD, scratchEnergyUploadCount.load() - (Btoi(Txn.application_args[1]) * Int(100))),  # Update the uploaded energy in global storage
            
            App.globalPut(ENERGY_PURCHASE, scratchEnergyPurchased.load() + (Btoi(Txn.application_args[1]) * Int(100))),  # Update the energy purchase in global storage
            Return(Int(1))  # Return success
        ).Else(
            Return(Int(0))  # Return failure
        )
    ])

# to retrive the upload energy back to account(upload energy-> purchase energy)
def retrieve_energy_upload_all():
    return Seq([
        scratchEnergyUploadCount.store(App.globalGet(ENERGY_UPLOAD)),       # Get the energy upload in global storage
        scratchEnergyPurchased.store(App.globalGet(ENERGY_PURCHASE)),      # Get the energy purchased in global storage
        scratchEnergyUploadRemain.store(App.globalGet(ENERGY_UPLOAD_REMAIN)),      # Get the energy remain in global storage
        # Check if the user has enough energy to retrieve
        If(scratchEnergyUploadRemain.load() >= Int(0)).Then(
            App.globalPut(ENERGY_UPLOAD, Int(0)),  # Update the uploaded energy in global storage
            App.globalPut(ENERGY_UPLOAD_REMAIN, Int(0)),  # Update the uploaded energy in global storage
            App.globalPut(ENERGY_PURCHASE, scratchEnergyPurchased.load() + scratchEnergyUploadRemain.load()),  # Update the energy purchase in global storage
            Return(Int(1))  # Return success
        ).Else(
            Return(Int(0))  # Return failure
        )
    ])

# def modify_currency_add():
#     return Seq([
#         scratchCurrency.store(App.localGet(Txn.sender(), CURRENCY)),                 # Get the currency in local storage

#         scratchFinalPurchasePrice.store(Btoi(Txn.application_args[1])), 
#         If(scratchCurrency.load() >= Int(0)).Then(
#             App.localPut(Txn.sender(), CURRENCY, scratchCurrency.load() + scratchFinalPurchasePrice.load()),  # Update the current energy in local storage
#             Return(Int(1)),  # Return success
#         ).Else(
#             Return(Int(0))  # Return failure
#         )
#     ])

def modify_currency_add():
    return Seq([
        scratchCurrency.store(App.localGet(Txn.sender(), CURRENCY)),          
        App.localPut(Txn.sender(), CURRENCY, scratchCurrency.load() + (Btoi(Txn.application_args[1])* Int(100))),
        Return(Int(1))
    ])

def modify_currency_deduct():
    return Seq([
        scratchCurrency.store(App.localGet(Txn.sender(), CURRENCY)),          
        App.localPut(Txn.sender(), CURRENCY, scratchCurrency.load() - (Btoi(Txn.application_args[1])*Int(100))),
        Return(Int(1))
    ])

def modify_energy_add():
    return Seq([
        scratchEnergyCount.store(App.localGet(Txn.sender(), ENERGY)),       
        App.localPut(Txn.sender(), ENERGY, scratchEnergyCount.load() + (Btoi(Txn.application_args[1])*Int(100))),
        Return(Int(1))
    ])

def modify_energy_deduct():
    return Seq([
        scratchEnergyCount.store(App.localGet(Txn.sender(), ENERGY)),      
        App.localPut(Txn.sender(), ENERGY, scratchEnergyCount.load() - (Btoi(Txn.application_args[1])*Int(100))),
        Return(Int(1))
    ])

# def modify_energy_upload_add():
#     return Seq([
#         scratchEnergyUploadCount.store(App.globalGet(ENERGY_UPLOAD)), 
#         scratchEnergyUploadRemain.store(App.globalGet(ENERGY_UPLOAD_REMAIN)),      # Get the energy remain in global storage
#         App.globalPut(ENERGY_UPLOAD, scratchEnergyUploadCount.load() + (Btoi(Txn.application_args[1])*Int(100))),
#         App.globalPut(ENERGY_UPLOAD_REMAIN, scratchEnergyUploadRemain.load() + (Btoi(Txn.application_args[1])*Int(100))),
#         Return(Int(1))
#     ])

# def modify_energy_upload_deduct():
#     return Seq([
#         scratchEnergyUploadCount.store(App.globalGet(ENERGY_UPLOAD)), 
#         scratchEnergyUploadRemain.store(App.globalGet(ENERGY_UPLOAD_REMAIN)),      # Get the energy remain in global storage
#         App.globalPut(ENERGY_UPLOAD, scratchEnergyUploadCount.load() - (Btoi(Txn.application_args[1])*Int(100))),
#         App.globalPut(ENERGY_UPLOAD_REMAIN, scratchEnergyUploadRemain.load() - (Btoi(Txn.application_args[1])*Int(100))),
#         Return(Int(1))
#     ])

# def modify_energy_purchase_add():
#     return Seq([
#         scratchEnergyPurchased.store(App.globalGet(ENERGY_PURCHASE)), 
#         App.globalPut(ENERGY_PURCHASE, scratchEnergyPurchased.load() + (Btoi(Txn.application_args[1])*Int(100))),
#         Return(Int(1))
#     ])

# def modify_energy_purchase_deduct():
#     return Seq([
#         scratchEnergyPurchased.store(App.globalGet(ENERGY_PURCHASE)),
#         App.globalPut(ENERGY_PURCHASE, scratchEnergyPurchased.load() - (Btoi(Txn.application_args[1])*Int(100))),
#         Return(Int(1))
#     ])

# for demo purpose only
# def energy_upload_purchase_by_someone():
#     return Seq([
#         scratchEnergyUploadRemain.store(App.globalGet(ENERGY_UPLOAD_REMAIN)),      # Get the energy remain in global storage
#         scratchEnergyUploadSold.store(App.globalGet(ENERGY_UPLOAD_SOLD)),      # Get the energy remain in global storage
#         scratchCurrency.store(App.localGet(Txn.sender(), CURRENCY)),                 # Get the currency in local storage

#         If(scratchEnergyUploadRemain.load() >= (Btoi(Txn.application_args[1])*Int(100))).Then(
#             App.globalPut(ENERGY_UPLOAD_REMAIN, scratchEnergyUploadRemain.load() - (Btoi(Txn.application_args[1])*Int(100))),  # Update the uploaded energy in global storage
#             App.globalPut(ENERGY_UPLOAD_SOLD, scratchEnergyUploadSold.load() + (Btoi(Txn.application_args[1])*Int(100))),  # Update the uploaded energy in global storage

#             scratchFinalPurchasePrice.store((Btoi(Txn.application_args[1])*Int(100)) * Btoi(Txn.application_args[2])), # final purchase price = energy amount * price per amount
#             App.localPut(Txn.sender(), CURRENCY, scratchCurrency.load() + scratchFinalPurchasePrice.load()),  # Update the current energy in local storage

#             Return(Int(1))  # Return success
#         ).Else(
#             Return(Int(0))  # Return failure
#         )
#     ])

def approval_program():
    handle_creation = Seq([
        # App.globalPut(ENERGY_MARKET, Int(1000)),
        # App.globalPut(Bytes("seller_1"), Addr(seller_1_address)),
        # App.globalPut(Bytes("seller_2"), Addr(seller_2_address)),
        # App.globalPut(Bytes("seller_3"), Addr(seller_3_address)),
        App.globalPut(SELLER_1_ENERGY, Int(4000)),
        App.globalPut(SELLER_2_ENERGY, Int(8000)),
        App.globalPut(SELLER_3_ENERGY, Int(16000)),
        App.globalPut(ENERGY_PURCHASE, Int(0)),
        App.globalPut(ENERGY_UPLOAD, Int(0)),
        App.globalPut(ENERGY_UPLOAD_REMAIN, Int(0)),
        App.globalPut(ENERGY_UPLOAD_SOLD, Int(0)),
        App.globalPut(ENERGY_UPLOAD_PRICE, Int(1)),
        Return(Int(1))
    ])

    # handle_optin = Return(Int(1))
    handle_optin = Seq([
        App.localPut(Txn.sender(), CURRENCY, Int(10000)),
        App.localPut(Txn.sender(), ENERGY, Int(4000)),
        App.localPut(Txn.sender(),ENERGY_BALANCE,Int(0)),
        App.localPut(Txn.sender(), ENERGY_THRESHOLD, Int(100)),
        Return(Int(1))
    ])
    handle_closeout = Return(Int(1))
    handle_updateapp = Return(Int(0))
    handle_deleteapp = Return(Int(0))
    globalCount = ScratchVar(TealType.uint64)
    localCount = ScratchVar(TealType.uint64)
    sellerCount = ScratchVar(TealType.uint64)

    # # for update total energy user have at the moment
    # scratchEnergyProduced =  ScratchVar(TealType.uint64)
    # scratchEnergyPurchased =  ScratchVar(TealType.uint64)

    # Devoloper mode to add energy to the account
    # add_currency_10 = Seq([
    #     localCount.store(App.localGet(Txn.sender(), CURRENCY)),
    #     App.localPut(Txn.sender(), CURRENCY, localCount.load() + Int(10)),
    #     Return(Int(1))
    # ])

    add_currency_100 = Seq([
        localCount.store(App.localGet(Txn.sender(), CURRENCY)),
        App.localPut(Txn.sender(), CURRENCY, localCount.load() + Int(100)),
        Return(Int(1))
    ])

    # Devoloper mode to deduct energy from the account
    # deduct_currency_10 = Seq([
    #     localCount.store(App.localGet(Txn.sender(), CURRENCY)),
    #     App.localPut(Txn.sender(), CURRENCY, localCount.load() - Int(10)),
    #     Return(Int(1))
    # ])

    deduct_currency_100 = Seq([
        localCount.store(App.localGet(Txn.sender(), CURRENCY)),
        App.localPut(Txn.sender(), CURRENCY, localCount.load() - Int(100)),
        Return(Int(1))
    ])

    # Devoloper mode to add energy to the account
    # add_energy_10 = Seq([
    #     localCount.store(App.localGet(Txn.sender(), ENERGY)),
    #     App.localPut(Txn.sender(), ENERGY, localCount.load() + Int(10)),
    #     Return(Int(1))
    # ])

    add_energy_100 = Seq([
        localCount.store(App.localGet(Txn.sender(), ENERGY)),
        App.localPut(Txn.sender(), ENERGY, localCount.load() + Int(100)),
        Return(Int(1))
    ])

    # Devoloper mode to deduct energy from the account
    # deduct_energy_10 = Seq([
    #     localCount.store(App.localGet(Txn.sender(), ENERGY)),
    #     App.localPut(Txn.sender(), ENERGY, localCount.load() - Int(10)),
    #     Return(Int(1))
    # ])

    deduct_energy_100 = Seq([
        localCount.store(App.localGet(Txn.sender(), ENERGY)),
        App.localPut(Txn.sender(), ENERGY, localCount.load() - Int(100)),
        Return(Int(1))
    ])

    add_energy_upload_100 = Seq([
        globalCount.store(App.globalGet(ENERGY_UPLOAD)),
        App.globalPut(ENERGY_UPLOAD, globalCount.load() + Int(100)),
        Return(Int(1))
    ])

    deduct_energy_upload_100 = Seq([
        globalCount.store(App.globalGet(ENERGY_UPLOAD)),
        App.globalPut(ENERGY_UPLOAD, globalCount.load() - Int(100)),
        Return(Int(1))
    ])

    add_energy_purchase_100 = Seq([
        globalCount.store(App.globalGet(ENERGY_PURCHASE)),
        App.globalPut(ENERGY_PURCHASE, globalCount.load() + Int(100)),
        Return(Int(1))
    ])

    deduct_energy_purchase_100 = Seq([
        globalCount.store(App.globalGet(ENERGY_PURCHASE)),
        App.globalPut(ENERGY_PURCHASE, globalCount.load() - Int(100)),
        Return(Int(1))
    ])

    reset = Seq([
        App.localPut(Txn.sender(), CURRENCY, Int(10000)),
        App.localPut(Txn.sender(), ENERGY, Int(4000)),
        App.globalPut(ENERGY_UPLOAD, Int(0)),
        App.globalPut(ENERGY_UPLOAD_PRICE, Int(1)),
        App.globalPut(ENERGY_PURCHASE, Int(0)),
        App.localPut(Txn.sender(),ENERGY_BALANCE,Int(0)),
        App.globalPut(SELLER_1_ENERGY, Int(4000)),
        App.globalPut(SELLER_2_ENERGY, Int(8000)),
        App.globalPut(SELLER_3_ENERGY, Int(16000)),
        App.globalPut(ENERGY_UPLOAD_REMAIN, Int(0)),
        App.globalPut(ENERGY_UPLOAD_SOLD, Int(0)),
        App.localPut(Txn.sender(), ENERGY_THRESHOLD, Int(100)),

        Return(Int(1))
    ])

    energy_upload_purchase_by_someone = Seq([
        scratchEnergyUploadRemain.store(App.globalGet(ENERGY_UPLOAD_REMAIN)),      # Get the energy remain in global storage
        scratchEnergyUploadSold.store(App.globalGet(ENERGY_UPLOAD_SOLD)),      # Get the energy remain in global storage
        scratchCurrency.store(App.localGet(Txn.sender(), CURRENCY)),                 # Get the currency in local storage

        If(scratchEnergyUploadRemain.load() >= (Btoi(Txn.application_args[1])*Int(100))).Then(
            App.globalPut(ENERGY_UPLOAD_REMAIN, scratchEnergyUploadRemain.load() - (Btoi(Txn.application_args[1])*Int(100))),  # Update the uploaded energy in global storage
            App.globalPut(ENERGY_UPLOAD_SOLD, scratchEnergyUploadSold.load() + (Btoi(Txn.application_args[1])*Int(100))),  # Update the uploaded energy in global storage

            scratchFinalPurchasePrice.store((Btoi(Txn.application_args[1])*Int(100)) * Btoi(Txn.application_args[2]) *Int(472)), # final purchase price = energy amount * price per amount
            
            InnerTxnBuilder.Begin(), #Begin preparation of a new inner transaction
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: Addr("ZZGQZNLZ33I4RC7MLGPJEIMRRKRMIJJVKT376CZXNAFJP3C5B7NZUB4AXY"),
                TxnField.amount: scratchFinalPurchasePrice.load(),
                TxnField.fee: Int(1000),
            }),
            InnerTxnBuilder.Submit(), 
            
            # App.localPut(Txn.sender(), CURRENCY, scratchCurrency.load() + scratchFinalPurchasePrice.load()),  # Update the current energy in local storage


            Return(Int(1))  # Return success
        ).Else(
            Return(Int(0))  # Return failure
        )   
    ])

    # payment = Seq([
    #     Assert(fullpay_cond), 
	# 	InnerTxnBuilder.Begin(),
	# 	InnerTxnBuilder.SetFields({
	# 		TxnField.type_enum: TxnType.Payment,
	# 		TxnField.sender:guest_addr,
	# 		TxnField.receiver:host_addr,
	# 		TxnField.amount:App.globalGet(Bytes("total"))
	# 	}),
	# 	InnerTxnBuilder.Submit(),
    #     Return(Int(1))
    # ])

    # # To upload energy in certain amount only
    # upload_energy_10 = Seq(
    #     scratchCount.store(App.globalGet(ENERGY_UPLOAD)),       # Get the energy upload in global storage
    #     localCount.store(App.localGet(Txn.sender(), ENERGY)),   # Get the energy produced in local storage
    #     # Check if the user has enough energy to upload
    #     If(localCount.load() >= Int(10)).Then(
    #         App.globalPut(ENERGY_UPLOAD, scratchCount.load() + Int(10)),  # Update the current energy in global storage
    #         App.localPut(Txn.sender(), ENERGY, localCount.load() - Int(10)),  # Update the current energy in local storage
    #         Return(Int(1))  # Return success
    #     ).Else(
    #         Return(Int(0))  # Return failure
    #     )
    # )

    # upload_energy_100 = Seq(
    #     scratchCount.store(App.globalGet(ENERGY_UPLOAD)),       # Get the energy upload in global storage
    #     localCount.store(App.localGet(Txn.sender(), ENERGY)),   # Get the energy produced in local storage
    #     # Check if the user has enough energy to upload
    #     If(localCount.load() >= Int(100)).Then(
    #         App.globalPut(ENERGY_UPLOAD, scratchCount.load() + Int(100)),  # Update the current energy in global storage
    #         App.localPut(Txn.sender(), ENERGY, localCount.load() - Int(100)),  # Update the current energy in local storage
    #         Return(Int(1))  # Return success
    #     ).Else(
    #         Return(Int(0))  # Return failure
    #     )
    # )

    
    # # to refresh total energy user have at the moment
    # update_total_energy = Seq([
    #     scratchEnergyProduced.store(App.localGet(Txn.sender(),ENERGY)),                 # Get the energy produced in local storage
    #     scratchEnergyPurchased.store(App.globalGet(ENERGY_PURCHASE)),      # Get the energy purchased in global storage
    #     App.localPut(Txn.sender(),ENERGY_BALANCE,scratchEnergyProduced.load()+scratchEnergyPurchased.load()), # Update the energy balance in local storage
    #     Return(Int(1))
    # ])
    # purchase_energy_seller_1 = Seq(
    #     scratchCount.store(App.globalGet(SELLER_1_ENERGY)),       # Get the energy upload in global storage
    #     localCount.store(App.localGet(Txn.sender(), CURRENCY)),                 # Get the currency in local storage
    #     # Check if the user has enough money to purchase
    #     If(localCount.load() >= Btoi(Txn.application_args[1])).Then(
    #         App.globalPut(SELLER_1_ENERGY, scratchCount.load() - Btoi(Txn.application_args[1])),  # Update the current energy in global storage
    #         App.localPut(Txn.sender(), CURRENCY, localCount.load() - Btoi(Txn.application_args[1])),  # Update the current energy in local storage
    #         App.localPut(Txn.sender(), ENERGY, App.localGet(Txn.sender(), ENERGY_PURCHASE) + Btoi(Txn.application_args[1])),  # Update the energy purchase in local storage
    #         update_total_energy(),
    #         Return(Int(1))  # Return success
    #     ).Else(
    #         Return(Int(0))  # Return failure
    #     )
    # )

    # purchase_energy_seller_2 = Seq(
    #     scratchCount.store(App.globalGet(SELLER_2_ENERGY)),       # Get the energy upload in global storage
    #     localCount.store(App.localGet(Txn.sender(), CURRENCY)),                 # Get the currency in local storage
    #     sellerCount.store(App.localGet(Addr(seller_2_address), CURRENCY)),    # Get the currency of seller local storage

    #     # Calculate the payment amount
    #     # amount = Btoi(Txn.application_args[1]),
    #     # payment = Btoi(Txn.application_args[2]),
    #     # Check if the user has enough money to purchase
    #     If(localCount.load() >= Btoi(Txn.application_args[2])).Then(
    #         App.globalPut(SELLER_2_ENERGY, scratchCount.load() - Btoi(Txn.application_args[1])),  # Update the current energy in global storage
    #         App.localPut(Txn.sender(), CURRENCY, localCount.load() - Btoi(Txn.application_args[2])),  # Update the current energy in local storage
    #         App.localPut(Txn.sender(), ENERGY, App.localGet(Txn.sender(), ENERGY_PURCHASE) + Btoi(Txn.application_args[1])),  # Update the energy purchase in local storage
    #         update_total_energy,
    #         # update seller currency

    #         # seller_2_local_currency = App.localGet(Addr(seller_2_address), CURRENCY),
    #         App.localPut(Addr(seller_2_address), CURRENCY, sellerCount.load() + Btoi(Txn.application_args[2])),
    #         Return(Int(1)),  # Return success
    #     ).Else(
    #         Return(Int(0))  # Return failure
    #     )
    # )

    handle_noop = Seq(
        Assert(Global.group_size() == Int(1)), 
        Cond(
            [Txn.application_args[0] == Bytes("Add_Currency_100"), add_currency_100],
            [Txn.application_args[0] == Bytes("Deduct_Currency_100"), deduct_currency_100],
            [Txn.application_args[0] == Bytes("Add_Energy_100"), add_energy_100],
            [Txn.application_args[0] == Bytes("Deduct_Energy_100"), deduct_energy_100],
            [Txn.application_args[0] == Bytes("Add_Energy_Upload_100"), add_energy_upload_100],
            [Txn.application_args[0] == Bytes("Deduct_Energy_Upload_100"), deduct_energy_upload_100],
            [Txn.application_args[0] == Bytes("Add_Energy_Purchase_100"), add_energy_purchase_100],
            [Txn.application_args[0] == Bytes("Deduct_Energy_Purchase_100"), deduct_energy_purchase_100],
            [Txn.application_args[0] == Bytes("Reset"), reset],
            [Txn.application_args[0] == Bytes("Edit_Energy_Upload_Price"), edit_energy_upload_price()],
            [Txn.application_args[0] == Bytes("Retrieve_Energy_Upload"), retrieve_energy_upload()],
            [Txn.application_args[0] == Bytes("Retrieve_Energy_Upload_All"), retrieve_energy_upload_all()],
            [Txn.application_args[0] == Bytes("Energy_Upload_Purchase_By_Someone"), energy_upload_purchase_by_someone],
            [Txn.application_args[0] == Bytes("Modify_Currency_Add"), modify_currency_add()],
            [Txn.application_args[0] == Bytes("Modify_Currency_Deduct"), modify_currency_deduct()],
            [Txn.application_args[0] == Bytes("Modify_Energy_Add"), modify_energy_add()],
            [Txn.application_args[0] == Bytes("Modify_Energy_Deduct"), modify_energy_deduct()],
            # [Txn.application_args[0] == Bytes("Modify_Energy_Upload_Add"), modify_energy_upload_add()],
            # [Txn.application_args[0] == Bytes("Modify_Energy_Upload_Deduct"), modify_energy_upload_deduct()],
            # [Txn.application_args[0] == Bytes("Modify_Energy_Purchase_Add"), modify_energy_purchase_add()],
            # [Txn.application_args[0] == Bytes("Modify_Energy_Purchase_Deduct"), modify_energy_purchase_deduct()],
            [Txn.application_args[0] == Bytes("Set_Threshold"), set_threshold()],
            [Txn.application_args[0] == Bytes("Upload_Energy"), upload_energy()],
            [Txn.application_args[0] == Bytes("Purchase_Energy_Seller_1"), purchase_energy_seller_1()],
            [Txn.application_args[0] == Bytes("Purchase_Energy_Seller_2"), purchase_energy_seller_2()],
            [Txn.application_args[0] == Bytes("Purchase_Energy_Seller_3"), purchase_energy_seller_3()],
        )
    )



    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.CloseOut, handle_closeout],
        [Txn.on_completion() == OnComplete.UpdateApplication, handle_updateapp],
        [Txn.on_completion() == OnComplete.DeleteApplication, handle_deleteapp],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop]
    )

    return compileTeal(program, Mode.Application, version=5)


def clear_state_program():
    program = Return(Int(1))
    return compileTeal(program, Mode.Application, version=5)


# Write to file
appFile = open("approval.teal", "w")
appFile.write(approval_program())
appFile.close()

clearFile = open("clear.teal", "w")
clearFile.write(clear_state_program())
clearFile.close()


# if __name__ == "__main__":
#     import os
#     import json

#     path = os.path.dirname(os.path.abspath(__file__))
#     approval, clear, contract = router.compile_program(version=8)

#     # Specify the directory path
#     directory_path = os.path.join(path, "artifacts")

#     # Create the directory if it doesn't exist
#     if not os.path.exists(directory_path):
#         os.makedirs(directory_path)

#     # Dump out the contract as json that can be read in by any of the SDKs
#     with open(os.path.join(path, "artifacts/contract.json"), "w") as f:
#         f.write(json.dumps(contract.dictify(), indent=2))

#     # Write out the approval and clear programs
#     with open(os.path.join(path, "artifacts/approval.teal"), "w") as f:
#         f.write(approval)

#     with open(os.path.join(path, "artifacts/clear.teal"), "w") as f:
#         f.write(clear)

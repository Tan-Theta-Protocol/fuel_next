contract;
use standards::src20::SRC20;
use standards::src3::SRC3;
use std::{
    asset::{
        burn,
        mint_to,
    },
    call_frames::msg_asset_id,
    constants::DEFAULT_SUB_ID,
    context::msg_amount,
    string::String,
};

configurable {
    /// The decimals of the asset minted by this contract.
    DECIMALS: u8 = 18u8,
    /// The name of the asset minted by this contract.
    NAME: str[18] = __to_str_array("US TanTheta Dollar"),
    /// The symbol of the asset minted by this contract.
    SYMBOL: str[4] = __to_str_array("USTD"),
    /// Owner of this contract which will be able to mint tokens.
    OWNER: Address = Address::from(0x0000000000000000000000000000000000000000000000000000000000000000),
}

storage {
    /// The total supply of the asset minted by this contract.
    total_supply: u64 = 0,
}

impl SRC3 for Contract {
    /// Unconditionally mints new assets using the default SubId.
    ///
    /// # Arguments
    ///
    /// * `recipient`: [Identity] - The user to which the newly minted asset is transferred to.
    /// * `sub_id`: [SubId] - The default SubId.
    /// * `amount`: [u64] - The quantity of coins to mint.
    ///
    /// # Number of Storage Accesses
    ///
    /// * Reads: `1`
    /// * Writes: `1`
    ///
    /// # Reverts
    ///
    /// * When the `sub_id` is not the default SubId.
    ///
    #[storage(read, write)]
    fn mint(recipient: Identity, sub_id: SubId, amount: u64) {
        // // Only owner must be able to mint tokens
        let sender = msg_sender().unwrap();
        if let Identity::Address(addr) = sender {
            require(addr == OWNER, "Not authorized");
        } else {
            revert(0);
        }

        require(sub_id == DEFAULT_SUB_ID, "Incorrect Sub Id");

        // Increment total supply of the asset and mint to the recipient.
        storage
            .total_supply
            .write(amount + storage.total_supply.read());
        mint_to(recipient, DEFAULT_SUB_ID, amount);
    }

    /// Unconditionally burns assets sent with the default SubId.
    ///
    /// # Arguments
    ///
    /// * `sub_id`: [SubId] - The default SubId.
    /// * `amount`: [u64] - The quantity of coins to burn.
    ///
    /// # Number of Storage Accesses
    ///
    /// * Reads: `1`
    /// * Writes: `1`
    ///
    /// # Reverts
    ///
    /// * When the `sub_id` is not the default SubId.
    /// * When the transaction did not include at least `amount` coins.
    /// * When the transaction did not include the asset minted by this contract.
    ///
    #[payable]
    #[storage(read, write)]
    fn burn(sub_id: SubId, amount: u64) {
        require(sub_id == DEFAULT_SUB_ID, "Incorrect Sub Id");
        require(msg_amount() >= amount, "Incorrect amount provided");
        require(
            msg_asset_id() == AssetId::default(),
            "Incorrect asset provided",
        );

        // Decrement total supply of the asset and burn.
        storage
            .total_supply
            .write(storage.total_supply.read() - amount);
        burn(DEFAULT_SUB_ID, amount);
    }
}

// SRC3 extends SRC20, so this must be included
impl SRC20 for Contract {
    #[storage(read)]
    fn total_assets() -> u64 {
        1
    }

    #[storage(read)]
    fn total_supply(asset: AssetId) -> Option<u64> {
        if asset == AssetId::default() {
            Some(storage.total_supply.read())
        } else {
            None
        }
    }

    #[storage(read)]
    fn name(asset: AssetId) -> Option<String> {
        if asset == AssetId::default() {
            Some(String::from_ascii_str(from_str_array(NAME)))
        } else {
            None
        }
    }

    #[storage(read)]
    fn symbol(asset: AssetId) -> Option<String> {
        if asset == AssetId::default() {
            Some(String::from_ascii_str(from_str_array(SYMBOL)))
        } else {
            None
        }
    }

    #[storage(read)]
    fn decimals(asset: AssetId) -> Option<u8> {
        if asset == AssetId::default() {
            Some(DECIMALS)
        } else {
            None
        }
    }
}
"""Handles the state and output for a single simulation round - Triple Coin Flip."""

from game_override import GameStateOverride
from src.events.events import *
import hashlib


class GameState(GameStateOverride):
    """Handle all game-logic and event updates for a given simulation number."""

    def sha256_bytes(self, value: str):
        return hashlib.sha256(value.encode()).digest()

    def map_payout(self, n: int) -> int:
        if n < 50:
            return 10
        elif n < 65:
            return 25
        elif n < 85:
            return 50
        elif n < 95:
            return 100
        else:
            return 500

    def game_from_simulation(self, simulation: int):
        # 1. hash input
        bytes_arr = list(self.sha256_bytes(str(simulation)))
        index = 0

        def get_roll():
            nonlocal index

            while True:
                byte = bytes_arr[index]
                index += 1

                if byte < 200:
                    return byte % 100

                # safety: if we run out, rehash deterministically
                if index >= len(bytes_arr):
                    new_hash = self.sha256_bytes(str(simulation) + ":" + str(index))
                    bytes_arr.extend(new_hash)

        # 3. coin logic
        def roll_coin():
            n = get_roll()

            if n < 40:
                return "H"
            elif n < 90:
                return "T"
            else:
                return "S"

        # 4. simulate 3 coins
        coins = [roll_coin(), roll_coin(), roll_coin()]

        # 5. payout if all side
        multiplier = None
        if all(c == "S" for c in coins):
            multiplier = self.map_payout(get_roll())
        else:
            multiplier = self.config.payout_table.get((coins.count("H"), "H"), 0)

        return {
            "coins": coins,
            "multiplier": multiplier
        }

    def run_spin(self, sim, simulation_seed=None):
        self.reset_seed(sim)
        self.repeat = True
        while self.repeat:
            self.reset_book()
            # ------------------------------------------------------------
            # Generate deterministic coin outcome
            # ------------------------------------------------------------

            result = self.game_from_simulation(sim)

            coins = result["coins"]
            multiplier = result["multiplier"]

            # ------------------------------------------------------------
            # Calculate win
            # ------------------------------------------------------------
            win_data = {
                "totalWin": multiplier,
            }

            self.win_manager.update_spinwin(win_data["totalWin"])
            self.win_manager.update_gametype_wins(self.gametype)

            # ------------------------------------------------------------
            # Emit frontend event
            # ------------------------------------------------------------
            game_event = {
                "index": len(self.book.events),
                "type": EventConstants.WIN_DATA.value,
                "numberRolled": int(sim + 1),
                "coins": [
                    {
                        "index": i,
                        "side": side,
                    }
                    for i, side in enumerate(coins)
                ],
                "multiplier": multiplier,
                # usually sent as cents
                "totalWin": int(round(win_data["totalWin"] * 100, 0)),
            }
            self.book.add_event(game_event)
            # ------------------------------------------------------------
            # Finalize spin
            # ------------------------------------------------------------
            self.evaluate_finalwin()

        self.imprint_wins()

    def run_freespin(self):
        pass

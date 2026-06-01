"""Handles the state and output for a single simulation round - Triple Coin Flip."""

from game_override import GameStateOverride
from src.events.events import *
import hashlib
import random


class GameState(GameStateOverride):
    """Handle all game-logic and event updates for a given simulation number."""

    def sha256_bytes(self, value: str):
        return hashlib.sha256(value.encode()).digest()

    def map_payout(self, n: int) -> int:
        if n < 80:
            return 10
        elif n < 95:
            return 50
        elif n < 98:
            return 100
        else:
            return 500

    def game_from_simulation(self, simulation: int):
        # 1. hash input
        bytes_arr = list(self.sha256_bytes(str(simulation)))
        index = 0

        def get_roll(max_value=10000):
            nonlocal index

            while True:
                if index + 1 >= len(bytes_arr):
                    new_hash = self.sha256_bytes(str(simulation) + ":" + str(index))
                    bytes_arr.extend(new_hash)

                value = (bytes_arr[index] << 8) | bytes_arr[index + 1]
                index += 2

                limit = (65536 // max_value) * max_value

                if value < limit:
                    return value % max_value

        def get_s_count():
            n = get_roll()
            
            if n < 7400:
                return 0 # 74%
            elif n < 9000:
                return 1 # 16%
            elif n < 9970:
                return 2 # 9.7%
            else:
                return 3 # 0.3%

        # 3. coin logic
        def roll_coin():
            n = get_roll(100)

            if n < 40:
                return "H"
            else:
                return "T"

        # 4. simulate 3 coins
        coins = [roll_coin(), roll_coin(), roll_coin()]
        s_count = get_s_count()
        positions = [0, 1, 2]
        for i in range(s_count):
            idx = get_roll(len(positions))
            coins[positions.pop(idx)] = "S"

        # 5. payout if all side
        multiplier = None
        if all(c == "S" for c in coins):
            multiplier = self.map_payout(get_roll(100))
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

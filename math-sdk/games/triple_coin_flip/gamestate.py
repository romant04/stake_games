"""Handles the state and output for a single simulation round - Triple Coin Flip."""

from game_override import GameStateOverride
from src.events.events import *
import random


class GameState(GameStateOverride):
    """Handle all game-logic and event updates for a given simulation number."""

    def _get_coin_result(self):
        coins = []
        for _ in range(3):
            x = random.randint(1, 10)
            if x < 2:
                coins.append("S")
            elif x < 6:
                coins.append("H")
            else:
                coins.append("T")

        winning_combination = (3, "S") if coins.count("S") == 3 else (coins.count("H"), "H")

        multiplier = self.config.payout_table.get(winning_combination, 0)

        return {
            "coins": coins,
            "multiplier": multiplier,
        }

    def run_spin(self, sim, simulation_seed=None):
        self.reset_seed(sim)
        self.repeat = True
        while self.repeat:
            self.reset_book()
            # ------------------------------------------------------------
            # Generate deterministic coin outcome
            # ------------------------------------------------------------

            result = self._get_coin_result()

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

"""Game configuration for Triple Coin Flip."""

from src.config.config import Config
from src.config.config import BetMode
from src.config.distributions import Distribution


class GameConfig(Config):
    """Configuration for the Triple Coin Flip game."""

    def __init__(self):
        super().__init__()

        # ------------------------------------------------------------------
        # Basic Game Info
        # ------------------------------------------------------------------

        self.game_id = "triple_coin_flip"
        self.provider_numer = 0
        self.working_name = "triple_coin_flip"

        self.win_type = "other"

        # SDK can auto-calculate RTP after simulations
        self.rtp = 0

        # Highest possible multiplier
        self.wincap = 100.0

        self.construct_paths()

        # ------------------------------------------------------------------
        # Coin Flip Configuration
        # ------------------------------------------------------------------

        self.num_coins = 3

        # Total possible outcomes
        self.total_outcomes = 2**self.num_coins
        self.payout_table = {
            (3, "H"): 4,
            (2, "H"): 1.5,
            (1, "H"): 0.5,
            (3, "S"): 50 
        }

        # ------------------------------------------------------------------
        # Required Engine Fields
        # ------------------------------------------------------------------

        # No reels in this game
        self.num_reels = 0
        self.num_rows = []

        self.paytable = {}

        self.include_padding = False

        self.special_symbols = {
            "wild": [],
            "scatter": [],
            "multiplier": [],
        }

        self.freespin_triggers = {
            self.basegame_type: {},
            self.freegame_type: {},
        }

        self.anticipation_triggers = {
            self.basegame_type: 0,
            self.freegame_type: 0,
        }

        # ------------------------------------------------------------------
        # Bet Modes
        # ------------------------------------------------------------------

        self.bet_modes = [
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=self.wincap,
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="basegame",
                        quota=1.0,
                        conditions={
                            "reel_weights": {},
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                ],
            ),
        ]

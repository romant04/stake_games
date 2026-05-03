"""Main file for generating results for Triple Coin Flip."""

from gamestate import GameState
from game_config import GameConfig
from src.state.run_sims import create_books
from src.write_data.write_configs import generate_configs

if __name__ == "__main__":

    num_threads = 4                    # ← More threads = faster
    batching_size = 100000
    compression = True
    profiling = False

    num_sim_args = {
        "base": int(1_000_000),        # ← 1 million sims (good precision)
    }

    run_conditions = {
        "run_sims": True,
        "run_optimization": True,      # ← Optional but recommended
        "run_analysis": True,
    }

    config = GameConfig()
    gamestate = GameState(config)

    if run_conditions["run_sims"]:
        create_books(
            gamestate,
            config,
            num_sim_args,
            batching_size,
            num_threads,
            compression,
            profiling,
        )
    generate_configs(gamestate)
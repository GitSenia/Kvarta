import logging

def get_logger(name: str = "app") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logging.basicConfig(
            level=logging.INFO,  # уровень по умолчанию
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
    return logger
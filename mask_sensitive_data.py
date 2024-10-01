# mask_sensitive_data.py
import re

def mask_file(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    masked_content = re.sub(r"(EMAIL_HOST_USER\s*=\s*').*?(')", r"\1****\2", content)
    masked_content = re.sub(r"(EMAIL_HOST_PASSWORD\s*=\s*').*?(')", r"\1****\2", masked_content)

    with open(file_path, 'w') as file:
        file.write(masked_content)

if __name__ == "__main__":
    import sys
    for file_path in sys.argv[1:]:
        mask_file(file_path)

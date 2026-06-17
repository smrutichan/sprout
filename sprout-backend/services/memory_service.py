memories = []

def save_memory(text):
    memories.append(text)
    return memories


def get_memories():
    return memories
print("Hello! I am your Python chatbot.")
while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit", "bye"]:
        print("Chatbot: Goodbye!")
        break
    else:
        print("Chatbot: You said:", user_input)

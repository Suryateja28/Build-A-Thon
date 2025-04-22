import openai

openai.api_key = "your-api-key-here"  # Replace with your real API key

def chat_with_gpt(prompt):
    print("Calling OpenAI API...")  # Debug message
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()

# A simple friendly chatbot function with responses to basic inputs
def simple_conversation(user_input):
    # Simple if-else conditions for greeting or basic conversation
    if user_input.lower() in ["hi", "hello", "hey"]:
        return "Hello! How are you?"
    elif user_input.lower() in ["how are you", "how are you doing"]:
        return "I'm doing great, thank you for asking! How about you?"
    elif user_input.lower() in ["bye", "exit", "quit"]:
        return "Goodbye! Have a great day!"
    else:
        return "Hmm, I don't quite understand. Can you say that in a different way?"

if __name__ == "__main__":
    while True:
        user_input = input("You: ")
        
        # If user wants to exit
        if user_input.lower() in ["quit", "exit", "bye"]:
            print("Chatbot: Goodbye! See you soon!")
            break
        
        # Use the chatbot function to get GPT's response
        chatbot_response = chat_with_gpt(user_input)
        
        # Simple conversation control (override GPT response for greetings)
        if user_input.lower() in ["hi", "hello", "hey"]:
            print("Chatbot:", simple_conversation(user_input))  # Greeting response
        else:
            print("Chatbot:", chatbot_response)  # GPT-based response

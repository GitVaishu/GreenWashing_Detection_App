import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
// Import the quiz data you created
import { greenwashingQuiz } from './data/quizData'; 

// Define a type for a single question object for better TypeScript support
interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

// Cast the imported array to the Question array type
const quizData: Question[] = greenwashingQuiz;

const QuizPg: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Get the current question object
  const currentQuestion = quizData[currentQuestionIndex];
  const totalQuestions = quizData.length;

  // --- HANDLERS ---
  const handleAnswerSelection = (optionIndex: number) => {
    // Prevent selecting a new answer if one has already been submitted
    if (isAnswerSubmitted) {
      return;
    }

    setSelectedOptionIndex(optionIndex);
    setIsAnswerSubmitted(true);

    // Check if the selected answer is correct and update the score
    if (optionIndex === currentQuestion.correctAnswerIndex) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    // Reset state for the next question
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < totalQuestions) {
      // Move to the next question
      setCurrentQuestionIndex(nextIndex);
    } else {
      // Quiz finished
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setQuizCompleted(false);
  };

  // --- RENDERING LOGIC ---

  // Component to render the options dynamically
  const renderOption = (option: string, index: number) => {
    let style = styles.optionButton;
    let textStyle = styles.optionText;

    if (isAnswerSubmitted) {
      // Case 1: The user selected this option
      if (index === selectedOptionIndex) {
        if (index === currentQuestion.correctAnswerIndex) {
          // CORRECT answer tapped
          style = { ...style, ...styles.correctAnswerButton };
        } else {
          // WRONG answer tapped
          style = { ...style, ...styles.wrongAnswerButton };
        }
      } 
      // Case 2: Highlight the CORRECT answer if the user got it wrong
      else if (index === currentQuestion.correctAnswerIndex) {
         style = { ...style, ...styles.correctAnswerOutline };
      }
    }

    return (
      <TouchableOpacity
        key={index}
        style={style}
        onPress={() => handleAnswerSelection(index)}
        // Disable touch after the answer is submitted
        disabled={isAnswerSubmitted} 
      >
        <Text style={textStyle}>{option}</Text>
      </TouchableOpacity>
    );
  };

  // Render the Final Score Screen
  if (quizCompleted) {
    return (
      <View style={styles.container}>
        <Text style={styles.scoreTitle}>Quiz Complete!</Text>
        <Text style={styles.scoreText}>
          You scored {score} out of {totalQuestions}
        </Text>
        
        <TouchableOpacity 
          style={styles.restartButton} 
          onPress={handleRestartQuiz}
        >
          <Text style={styles.restartButtonText}>Retake Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render the Current Question Screen
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </Text>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {currentQuestion.question}
          </Text>
        </View>

        {/* --- Options List --- */}
        {currentQuestion.options.map(renderOption)}

        {/* --- Feedback Section (Visible only after submission) --- */}
        {isAnswerSubmitted && (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackTitle}>
              {selectedOptionIndex === currentQuestion.correctAnswerIndex ? '✅ Correct Answer!' : '❌ Incorrect Answer'}
            </Text>
            <Text style={styles.explanationText}>
              <Text style={{ fontWeight: 'bold' }}>Explanation:</Text> {currentQuestion.explanation}
            </Text>
            
            {/* Next Button */}
            <TouchableOpacity 
              style={styles.nextButton} 
              onPress={handleNextQuestion}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f0f4f7', // Light background
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#007AFF', // Blue color for progress
    marginBottom: 10,
    fontWeight: '600',
  },
  questionContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 25,
  },
  // --- Option Button Styles ---
  optionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 5,
    width: '100%',
    alignItems: 'flex-start',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  // Feedback Colors
  correctAnswerButton: {
    backgroundColor: '#d4edda', // Light green
    borderColor: '#28a745', // Darker green border
  },
  correctAnswerOutline: {
    backgroundColor: '#f0fff4', // Very light green (to show the right answer)
    borderColor: '#28a745', // Darker green border
    borderWidth: 2,
  },
  wrongAnswerButton: {
    backgroundColor: '#f8d7da', // Light red/pink
    borderColor: '#dc3545', // Darker red border
  },
  // --- Feedback Box Styles ---
  feedbackBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e9ecef', // Light grey background
    borderRadius: 10,
    width: '100%',
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 15,
  },
  // --- Navigation Button ---
  nextButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- Result Screen Styles ---
  scoreTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizPg;
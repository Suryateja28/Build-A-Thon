
<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {

$input = file_get_contents('php://input');
if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'response' => 'No input received']);
    exit;
}

$data = json_decode($input, true);
if (!$data || !isset($data['message'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'response' => 'Invalid input format']);
    exit;
}

$message = strtolower($data['message']);

$responses = [
    'admission' => 'For admission inquiries, please visit our admissions office or call 555-0123.',
    'courses' => 'You can find our course catalog on the college website under Academics.',
    'fees' => 'Tuition fees vary by program. Please check our financial services page.',
    'schedule' => 'Class schedules are available through the student portal.',
    'deadline' => 'Application deadlines depend on the semester. Fall semester deadline is usually May 1st.',
    'default' => 'I\'m here to help! Please ask about admissions, courses, fees, schedules, or deadlines.'
];

$response = $responses['default'];
foreach ($responses as $key => $value) {
    if (strpos($message, $key) !== false) {
        $response = $value;
        break;
    }
}

echo json_encode(['response' => $response, 'status' => 'success']);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'response' => 'Internal server error. Please try again.'
  ]);
}
?>

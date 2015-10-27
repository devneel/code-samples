<?php

/* Devneel Vaidya
 * Created July 2010
 * Updated Oct 2015
 
 * Quiz Services handles services for quiz applications on Facebook. Facebook users used to take our quizzes for fun to find
 * out silly categorizations they fall in to based on their answers. For example, one of our more popular quizzes was
 * "Are you a geek, jock, nerd, or popular person?"
 * This code sample shows the controller level functions for quiz related methods

*/ 

// require entities (models) and core functions
require_once ( "/var/www/u/dkv4756" . "/o" ."/m/quiz/quiz-entity.php");
require_once ( "/var/www/u/dkv4756" . "/o" ."/m/quiz/quiz-validator.php");
require_once ( "/var/www/u/dkv4756" . "/o" ."/m/core/app-validator.php");
require_once ( "/var/www/u/dkv4756" . "/o" ."/m/quiz/quiz-response-entity.php");
require_once ( "/var/www/u/dkv4756" . "/o" ."/c/quiz/quiz-rating-services.php");
require_once ( "/var/www/u/dkv4756" . "/o" ."/m/quiz/quiz-question-validator.php");
require_once ( "/var/www/u/dkv4756" . "/o" ."/m/quiz/quiz-answer-validator.php");
require_once ( "/var/www/u/dkv4756" . "/o" ."/c/core/app-services.php");

/**
* These are the services around a quiz.
*/
class QuizServices {

	/**
	* View the quiz result for the given user id and quiz id
	* @param userid person who's result to look up
	* @param quizid quiz for which resutls are requested
	* @return array with the important values (result description, image url, etc.). An array with an entry for "error" key if something goes wrong.
	*/	
	public function viewQuizResults($userid, $quizid){
		if( QuizValidator::validateQuizId($quizid) ){
			return array("error"=>"Quiz id is not valid ($quizid)");
		}
		if( !$this->hasTakenQuiz($userid, $quizid) ){
			return array("error"=>"The user ($userid) has not taken the quiz ($quizid).");
		}
		// get the responses in an array.
		$responses = array();
		$numQs = $this->getNumQuestions($userid, $quizid);
		for( $q = 0; $q<$numQs; $q++ ){ 
			$quiz = $this->viewQuiz($userid, $quizid, $q);
			$quizResponse = new QuizResponseEntity();
			$quizResponse->loadWithoutId($userid, $quiz["question"]["questionid"]);
			$responses[] = array(
				"questionid" => $quizResponse->questionid,
				"answerid" => $quizResponse->answerid,
			);
		}
		$quizRatingServices = new QuizRatingServices();
		$ratingid = $quizRatingServices->rate($userid, $quizid, $responses);
		if( $ratingid<=0 ){
			return array("error"=>"No rating found");
		}
		$qRatE = new QuizRatingEntity();
		$qRatE->ratingid = $ratingid;
		$qRatE->load();
		return array(
			"rating"=>$qRatE->rating,
			"description"=>$qRatE->description, 
			"imageURL" => $qRatE->imageurl,
		);
	}
	
	/**
	* View a question of a quiz.
	* @param userid user who wants to do this action
	* @param quizid id of quiz to show
	* @param question_number 0 index number of question to show (first question is 0, second is 1, etc.)
	* @return array with question and answers.  An array with an entry for "error" key if something goes wrong.
	*/
	public function viewQuiz($userid, $quizid, $question_number) {
		if( QuizValidator::validateQuizId($quizid) ){
			return array("error"=>"Quiz id is not valid ($quizid)");
		}
		$quiz = new QuizEntity();
		$quiz->quizid = $quizid;
		$quiz->load();
		
		if( QuizValidator::validateQuestionNumber($question_number, count($quiz->questions)) ) {
			return array("error"=>"Received a question number ($question_number) less than zero or greater than ".count($quiz->questions));
		}

		return array(
			"name"=>$quiz->name,
			"question"=>$quiz->questions[$question_number],
		);
	}
	
	/**
	* To get the number of questions a quiz has
	* @param userid user who wants to do this action
	* @param quizid id of quiz to get num questions for
	* @return number of questions of the quiz.  Zero if the quiz doesn't exist or on error.
	*/
	public function getNumQuestions($userid, $quizid) {
		if( QuizValidator::validateQuizId($quizid) ){
			return 0;
		}
		$quiz = new QuizEntity();
		$quiz->quizid = $quizid;
		$quiz->load();
		return count($quiz->questions);
	}
	
	/**
	*  See if the user has taken the quiz
	* @param userid user id of user to check
	* @param quizid id of quiz to check
	* @return TRUE if the user has taken this quiz, FALSE if not or on error.
	*/
	public function hasTakenQuiz($userid, $quizid) {
		if( QuizValidator::validateQuizId($quizid) ) {
			return FALSE;
		}
		$numQs = $this->getNumQuestions($userid, $quizid);
		for( $q = 0; $q<$numQs; $q++ ){ 
			$quiz = $this->viewQuiz($userid, $quizid, $q);
			$quizResponse = new QuizResponseEntity();
			$quizResponse->loadWithoutId($userid, $quiz["question"]["questionid"]);
			if( $quizResponse->responseid == 0 ){
				return FALSE;
			}		
		}
		return TRUE;
	}
	
	/**
	* Send in an answer to a question on a quiz by a user
	* @param userid user who answered
	* @param questionid the question which was answered
	* @param answerid answer that was chosen
	* @returns true on success
	*/
	public function answerQuiz($userid, $questionid, $answerid){	
		if( QuizQuestionValidator::validateQuestionId($questionid) ){
			return FALSE;
		}
		if( QuizAnswerValidator::validateAnswerId($answerid) ){
			return FALSE;
		}
		$quizResponse = new QuizResponseEntity();
		$quizResponse->loadWithoutId($userid, $questionid);
		$quizResponse->answerid = $answerid;
		if( $quizResponse->responseid == 0 ){
			$quizResponse->userid = $userid;
			$quizResponse->questionid = $questionid;
			$quizResponse->saveInsert();
		} else {
			$quizResponse->saveUpdate();
		}
		return TRUE;
	}
	
	/**
	* returns current quiz ID
	* @return current quiz id
	*/
	public function getQuizID(){	
		$aS = new AppServices();	
		$appid = $aS->getAppId();
		if( !$appid ){
			return 0;
		}
		return $this->getQuizIdForAppId($appid);
	}
	
	/**
	* Gets the appid based on the quiz id
	* @param quizid quiz id to get appid for
	* @return appid for quiz, or zero on error or no app id
	*/
	public function getAppIdForQuizId($quizid) {
		if( QuizValidator::validateQuizId($quizid) ) {
			return 0;
		}
		$quiz = new QuizEntity();
		$quiz->quizid = $quizid;
		$quiz->load();
		return $quiz->appid;
	}
	
	/**
	* Gets the quizid based on the app id
	* @param appid app id to get quizid for
	* @return quizid for quiz, or zero on error or no quiz id
	*/
	public function getQuizIdForAppId($appid) {
		if( AppValidator::validateAppId($appid) ) {
			return 0;
		}
		$quiz = new QuizEntity();
		$quiz->appid = $appid;
		$quiz->loadByAppId();
		return $quiz->quizid;
	}
	
	/**
	* Gets all of the quiz ids in an array
	* @return array with ids of quizzes.  Empty array in case of error
	*/
	public function getAllQuizIds() {
		$q = new QuizEntity();
		return $q->getAllQuizIds();
	}
}


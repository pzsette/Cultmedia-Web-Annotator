<?php

	header('Content-Type: text/json');
	require_once("config.php");

	$action = $_POST['action'];
	
	/* conterrà la stringa di query al database */
	$query_string = "";
	//echo($action);
	
	/* smista secondo il tipo di richiesta */
	switch($action) {
		
		case "load" : 
			loadData();
		break;
		case "insert" :
			//echo($action);
			insertData();
		break; 
		case "update" :
	   		updateData();
		break;
		case "delete" :
			deleteData();
		break;
	}
	
	function loadData() {
		
		$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE); 
		
		if (isset($_POST['sourceId'])) {
			$query_string = "select v.`id`, v.`title`, v.`path` from `videos` as v where v.`id`=" . $_POST['sourceId'];
			$query_string_annotations = "select ann.`id`, ann.`start`, ann.`end`, ann.`arousal`, ann.`valence` from `annotations` as ann where ann.`video_id`=" . $_POST['sourceId'] . " order by ann.`start` desc";
			
			$result_annotations = $mysqli->query($query_string_annotations); 
			
			// cicla sul risultato
			$annotations = array();
			while ($row = $result_annotations->fetch_array(MYSQLI_ASSOC)) {

				$annotation_id = $row['id'];
				$annotation_start = $row['start'];
				$annotation_end = $row['end'];
				$annotation_arousal = $row['arousal'];
				$annotation_valence = $row['valence'];

				$annotation = array('id' => $annotation_id,'start' =>$annotation_start, 'end' => $annotation_end, 'arousal' => $annotation_arousal,'valence' => $annotation_valence);
				array_push($annotations, $annotation);
			}
			
		} else {
			$query_string = "select v.`id`, v.`title`, v.`path` from `videos` as v"; 
		}
		//print($query_string);
		
	
    	// esegui la query
		$result = $mysqli->query($query_string); 
	
    	$videos = array();	
    
    	// cicla sul risultato
		while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
		
			$video_id = $row['id'];
			$video_title = $row['title'];
			$video_path = $row['path'];
  
			$video = array('id' => $video_id,'title' =>$video_title, 'path' => $video_path);
			array_push($videos, $video);
		}
		
		
		if (isset($_POST['sourceId'])) {
			$response = array('videos' => $videos, 'type' => 'load', 'annotations' => $annotations);
		} else {
			$response = array('videos' => $videos, 'type' => 'load-list');
		}
    	

		// encodo l'array in JSON
		echo json_encode($response);	
	
}
	
	function insertData() {
		
		if (isset($_POST['videoId'])) {
			$video_id = $_POST['videoId'];
		} else {
			echo "you didn't specify a videoId";
			return;
		}
		
		if (isset($_POST['start'])) {
			$video_start = $_POST['start'];
		} else {
			echo "you didn't specify a starttime";
			return;
		}
		
		if (isset($_POST['end'])) {
			$video_end = $_POST['end'];
		} else {
			echo "you didn't specify a endtime";
			return;
		}
		
		if (isset($_POST['arousal'])) {
			$video_arousal = $_POST['arousal'];
		} else {
			echo "you didn't specify a arousal";
			return;
		}
		
		if (isset($_POST['valence'])) {
			$video_valence = $_POST['valence'];
		} else {
			echo "you didn't specify a valence";
			return;
		}
		
		$video_arousal_norm = 0;
		if ($video_arousal < 4) {
    		$video_arousal_norm = -1;
		} elseif ($video_arousal > 6) {
    		$video_arousal_norm = 1;
		} else {
    		$video_arousal_norm = 0;
		}

		
		$video_valence_norm = 0;
		if ($video_valence < 4) {
    		$video_valence_norm = -1;
		} elseif ($video_valence > 6) {
    		$video_valence_norm = 1;
		} else {
    		$video_valence_norm = 0;
		}


		
		$query_string = "insert into `annotations` (`video_id`, `arousal`, `valence`, `start`, `end`, `arousal_norm`, `valence_norm`) values (" . $video_id . ", ". $video_arousal . ", ". $video_valence . ", ". $video_start . ", " . $video_end. ", ". $video_arousal_norm . ", " . $video_valence_norm .  ")";
//		$query_string = "INSERT INTO to_do (text) values ('". htmlspecialchars($to_do_text) . "')";
		
		//echo $query_string;
		$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE); 
	
    	// esegui la query per inserire il to do nel db
		$result = $mysqli->query($query_string); 
	
		$query_string = "select ann.`id`, ann.`arousal`, ann.`valence`, ann.`start`, ann.`end` from `annotations` as ann where ann.`id`=" . $mysqli->insert_id;
		
		
//    	$query_string = 'SELECT * FROM to_do WHERE ID=' . $mysqli->insert_id; 
	
		//$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE); 
	
    	// esegui la query per rileggere il record inserito
		$result = $mysqli->query($query_string); 
	
    	$annotations = array();	
    
    	// cicla sul risultato
		while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
		
			$annotation_id = $row['id'];
			$annotation_video_id = $row['video_id'];
			$annotation_arousal = $row['arousal'];
  			$annotation_valence = $row['valence'];
			$annotation_start = $row['start'];
			$annotation_end = $row['end'];
  
			$annotation = array('id' => $annotation_id,'video_id' =>$annotation_id, 'arousal' => $annotation_arousal, 'valence' => $annotation_valence, 'start' => $annotation_start, 'end' => $annotation_end);
			array_push($annotations, $annotation);
		}
	
    	$response = array('annotations' => $annotations, 'type' => 'insert');

		// encodo l'array in JSON
		echo json_encode($response);	
	
	}
	
	function updateData() {
		if (isset($_POST['id'])) $id = $_POST['id'];
		if (isset($_POST['status'])) $status = $_POST['status'];
	
		$pieces = explode("_", $id);
	
		$query_string = 'UPDATE to_do SET completed=' . $status . ' WHERE ID=' . $pieces[1];
		
		$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE); 
	
    	// esegui la query
		$result = $mysqli->query($query_string); 
	
		//echo $query_string;
	
    	if($mysqli->affected_rows > 0) {
		// encodo l'array in JSON

	  		$response = array('updated' => true, 'id' => $id, 'type' => 'update');
		
		} else {
	  		$response = array('updated' => false, 'id' => $id, 'type' => 'update');	
		}
	
	echo json_encode($response);
	
}

	
	function deleteData() {
		
		if (isset($_POST['annotationId'])) $id = $_POST['annotationId'];
	
			
	
			$query_string = 'delete from `annotations` where `id`=' . $id; 
			
			$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE); 
	
    		// esegui la query
			$result = $mysqli->query($query_string); 
	
    		if($mysqli->affected_rows > 0) {

				// encodo l'array in JSON
	  			$response = array('deleted' => true, 'id' => $id, 'type' => 'delete');
			} else {
	  			$response = array('deleted' => false, 'id' => $id, 'type' => 'delete');
	  		}
	
			echo json_encode($response);
	}
	
?>
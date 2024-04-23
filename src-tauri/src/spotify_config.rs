use serde_json::Value;

fn parse_config() -> (String, String, String) {
    // JSON file
    let json_file: &str = "/opt/pomofusion/spotify.json"; // Local

    let json_parse = {
        // Load the JSON file and convert to an easier to read format
        let json_convert = std::fs::read_to_string(&json_file).expect("Unable to locate file");
        serde_json::from_str::<Value>(&json_convert).unwrap()
    };

    let client_id = &json_parse["SpotifyData"]["CLIENT_ID"];
    let client_secret = &json_parse["SpotifyData"]["CLIENT_SECRET"];
    let redirect_uri = &json_parse["SpotifyData"]["REDIRECT_URI"];

    return (client_id.to_owned().to_string(), client_secret.to_owned().to_string(), redirect_uri.to_owned().to_string())
}

pub fn get_client_id() -> String {
    return parse_config().0
}

pub fn get_client_secret() -> String {
    return parse_config().1
}

pub fn get_redirect_uri() -> String {
    return parse_config().2
}

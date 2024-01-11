// ignore_for_file: must_be_immutable
import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: SignUpSection(),
      routes: {
        LandingScreen.id: (context) => LandingScreen(),
        LoginSection.id: (context) => LoginSection(),
      },
    );
  }
}

//sign up section
class SignUpSection extends StatelessWidget {
  var email;
  var password;

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
        navigationBar: CupertinoNavigationBar(
          automaticallyImplyLeading: false,
        ),
        child: SafeArea(
            child: ListView(padding: const EdgeInsets.all(16), children: [
          Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: CupertinoTextField(
                  placeholder: "Email",
                  onChanged: (value) {
                    email = value;
                  })),
          Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: CupertinoTextField(
                  placeholder: "Password",
                  obscureText: true,
                  onChanged: (value) {
                    password = value;
                  })),
          ElevatedButton.icon(
              onPressed: () async {
                await signup(email, password);
                SharedPreferences prefs = await SharedPreferences.getInstance();
                String? token = prefs.getString("token");
                if (token != null) {
                  Navigator.pushNamed(context, LandingScreen.id);
                }
              },
              icon: Icon(Icons.save),
              label: Text("Sign UP")),
          ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, LoginSection.id);
              },
              child: Text("login")),
        ])));
  }
}

//login section
class LoginSection extends StatelessWidget {
  static const String id = "LoginSection";
  var email;
  var password;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: CupertinoPageScaffold(
          navigationBar: CupertinoNavigationBar(
            automaticallyImplyLeading: false,
          ),
          child: SafeArea(
              child: ListView(padding: const EdgeInsets.all(16), children: [
            Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: CupertinoTextField(
                    placeholder: "Email",
                    onChanged: (value) {
                      email = value;
                    })),
            Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: CupertinoTextField(
                    placeholder: "Password",
                    obscureText: true,
                    onChanged: (value) {
                      password = value;
                    })),
            ElevatedButton.icon(
                onPressed: () async {
                  await login(email, password);
                  SharedPreferences prefs =
                      await SharedPreferences.getInstance();
                  String? token = prefs.getString("token");
                  if (token != null || token != "null") {
                    Navigator.pushNamed(context, LandingScreen.id);
                  }
                },
                icon: Icon(Icons.save),
                label: Text("Login"))
          ]))),
    );
  }
}

class LandingScreen extends StatelessWidget {
  static const String id = "LandingScreen";
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Center(child: Text("Welcome to the Landing Screen")),
        ElevatedButton.icon(
            onPressed: () async {
              SharedPreferences prefs = await SharedPreferences.getInstance();
              await prefs.setString('token', 'null');
              Navigator.pushNamed(context, LoginSection.id);
            },
            icon: Icon(Icons.send),
            label: Text("Logout"))
      ],
    ));
  }
}

// *** server handeling codes ***

final channel = WebSocketChannel.connect(Uri.parse('ws://localhost:4050'));

// Handles incoming messages from the WebSocket connection.
Future<void> handleIncomingMessages(dynamic message) async {
  print(message);

  /// Gets an instance of [SharedPreferences] and decodes the JSON message
  /// to extract the token, which is then saved in [SharedPreferences]
  /// under the key 'token'.
  /// executed in login/signup scenarios
  SharedPreferences prefs = await SharedPreferences.getInstance();
  var parse = jsonDecode(message);
  await prefs.setString('token', parse["token"]);
}

/// Closes the WebSocket connection by closing the sink.
void closeWebSocket() {
  channel.sink.close();
}

void _sendMessage(String route, Map<String, dynamic> data) {
  final message = {'route': route, 'data': data};
  channel.sink.add(jsonEncode(message));
}

/// Sends a login request with email and password to the
/// WebSocket server at the /login route.
login(email, password) {
  _sendMessage('/login', {'email': email, 'password': password});
}

/// Sends a signup request with email and password to the
/// WebSocket server at the /signup route.
signup(email, password) {
  _sendMessage('/signup', {'email': email, 'password': password});
}

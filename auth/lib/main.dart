// ignore_for_file: must_be_immutable

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

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

//sign up function
Future<bool> signup(email, password) async {
  //service url
  var url = "http://localhost:4000/signup";

  try {
    //sending request
    final http.Response response = await http.post(
      Uri.parse(url),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
      body: jsonEncode(<String, String>{
        'email': email,
        'password': password,
      }),
    );

    //debugging
    print(response.body);

    //check response status code
    if (response.statusCode == 201) {
      //save token in shared preferences
      SharedPreferences prefs = await SharedPreferences.getInstance();
      var parse = jsonDecode(response.body);
      await prefs.setString('token', parse["token"]);
      return true;
    } else {
      return false;
    }
  } catch (e) {
    print('Error occurred during signup: $e');
    // Handle the error here, e.g. show an error message to the user
    return false;
  }
}

//login function
Future<bool> login(email, password) async {
  //server url
  var url = "http://localhost:4000/login";

  try {
    //sending request
    final http.Response response = await http.post(
      Uri.parse(url),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
      body: jsonEncode(<String, String>{
        'email': email,
        'password': password,
      }),
    );

    //debugging
    print(response.body);

    //check response status code
    if (response.statusCode == 200) {
      //saving token in shared preferences
      SharedPreferences prefs = await SharedPreferences.getInstance();
      var parse = jsonDecode(response.body);
      await prefs.setString('token', parse["token"]);
      return true;
    } else {
      return false;
    }
  } catch (e) {
    print('Error occurred during login: $e');
    // Handle the error here, e.g. show an error message to the user
    return false;
  }
}

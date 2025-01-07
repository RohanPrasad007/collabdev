import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'auth_service.dart';

class AuthScreen extends StatelessWidget {
  final AuthService _authService = AuthService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Google Sign-In'),
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: () async {
            final user = await _authService.signInWithGoogle();
            if (user != null) {
              print("Signed in: ${user.displayName}");
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => HomeScreen(user: user)),
              );
            } else {
              print("Sign-in failed");
            }
          },
          child: Text('Sign in with Google'),
        ),
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  final User user;

  HomeScreen({required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Welcome, ${user.displayName}!'),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                await AuthService().signOut();
                Navigator.pop(context);
              },
              child: Text('Sign Out'),
            ),
          ],
        ),
      ),
    );
  }
}

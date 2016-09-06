export ANDROID_HOME=/Users/matthewmartz/Development/adt-bundle-mac-x86_64-20140702/sdk
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
export PATH=${PATH}:$ANDROID_HOME/build-tools/22.0.0

cordova build --release android
cd platforms/android/build/outputs/apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore /Users/matthewmartz/Development/WODRight-release-key.keystore android-release-unsigned.apk WODRightKey
./zipalign -v 4 android-release-unsigned.apk WODRight-ionic-20151205-a-signed.apk
cd ../../../../../
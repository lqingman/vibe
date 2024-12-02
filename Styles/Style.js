import { StyleSheet } from 'react-native'
import Color from './Color';

// Purpose: To store all the styles used in the app.
export default Style = StyleSheet.create({
    appContainer: {
      flex: 1,
      height: '100%',
    },
    container: {
      flex: 1,
      // padding: 10,
      backgroundColor: 'white',
    },
    profileContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      // marginBottom: 10,
      gap: 20,
      padding: 10,
      paddingTop: 20,
      paddingLeft: 20,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
    },
    profileName: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    profileInfo: {
      fontSize: 14,
      marginBottom: 5,
      color: 'gray',
    },
    profileTabBar: {
      backgroundColor: 'white',
      borderRadius: 10,
    },
    profileTabBarIndicator: {
      backgroundColor: '#363678',
      height: 5,
      borderRadius: 3,
    },
    profileTabBarLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#363678',
    },
    settingImagePicker: {
      alignItems: 'center',
      justifyContent: 'center',
  
    },
    label: {
      fontSize: 14,
      marginBottom: 5,
      color: 'gray',
      marginStart: 5,
    },
    input: {
      height: 40,
      borderColor: 'lightgray',
      borderRadius: 5,
      borderWidth: 1,
      marginBottom: 15,
      paddingHorizontal: 10,
    },
    button: {
      backgroundColor: '#363678',
      paddingVertical: 10,
      // paddingHorizontal: 30,
      // marginTop: 20,
      borderRadius: 5,
      width: '100%', 
      alignItems: 'center', 
    },
    buttonPressed: {
      backgroundColor: '#1884c7', 
      transform: [{ scale: 0.98 }], 
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    background: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      width: '100%',
      padding: 20,
    },
    appName: {
      fontSize: 36,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 30,
  
    },
    welcomeSlogan: {
      fontSize: 20,
      color: 'white',
      marginBottom: 30,
      // textAlign: 'left',
      fontWeight: 'bold',
  
    },
    welcomeDescription: {
      fontSize: 16,
      color: 'white',
      marginBottom: 200,
      textAlign: 'left',
    },
    welcomeButtonContainer: {
      flexDirection: 'column', 
      alignItems: 'center',
      width: '80%',
      gap: 20, 
    },
    header: {
      fontSize: 30,
      marginBottom: 20,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    slogan: {
      fontSize: 16,
      color: 'black',
      marginBottom: 100,
      textAlign: 'center',
    },

    strengthIndicator: {
      marginBottom: 10,
    },
    strengthBars: {
      flexDirection: 'row',
      gap: 10,
      // width: '90%',
      // marginTop: 5,
    },
    strengthBar: {
      flex: 1,
      height: 5,
      borderRadius: 2,
      backgroundColor: '#e0e0e0',
    },
    strengthText: {
      fontSize: 12,
      marginTop: 5,
      // marginBottom: 10,
      color:'red'
    },
    confirmText: {
      fontSize: 12,
      marginTop: 5,
      marginBottom: 10,
      color:'red'
    },
    underline: {
      color: 'gray',
      textAlign: 'center',
      // marginVertical: 15,
      textDecorationLine: 'underline',
    },
    forgotPassword: {
      color: '#1DA1F2',
      textAlign: 'center',
      marginVertical: 15,
      fontSize: 16,
      marginTop: 30,
      // textDecorationLine: 'underline',
    },
    locationButton: {
      backgroundColor: 'white',
      // height: "10%",
      justifyContent: 'center',
      // alignItems: 'center',
      padding: 10,
      borderRadius: 5,
      borderColor: 'lightgray',
      borderWidth: 1,
      // elevation: 5,
      // shadowColor: 'black',
      // shadowOffset: { width: 0, height: 2 },
      // shadowOpacity: 0.25,
      // shadowRadius: 3.84,
      marginBottom: 10,
      // minWidth: '45%', 
      // maxWidth: '90%',
      width: '100%',
      alignSelf: 'flex-start'
    },
    locationButtonContent: {
      flexDirection: 'row',
      // alignItems: 'center',
      // justifyContent: 'center',
      paddingHorizontal: 3,
      gap: 10,
    },
    locationText: {
      fontSize: 14,
      flexShrink: 1, 
      numberOfLines: 1, 
      ellipsizeMode: 'tail',
      paddingTop: 3,
    },
    descriptionContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 10,
      // gap: 10,
      justifyContent: 'space-between',
    },
    descriptionInput: {
      // flex: 1,
      height: 150,
      textAlignVertical: 'top',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
      alignItems: 'center',
      // marginTop: 20,
      marginHorizontal: 30,
    },
    createButton: {
      backgroundColor: '#363678',
      paddingVertical: 10,
      paddingHorizontal: 50,
      borderRadius: 5,
      // width: '100%', 
      alignItems: 'center', 
      marginTop: 10,
      marginBottom: 50,
    },
    AIbutton: {
      backgroundColor: 'White',
      // borderColor: 'lightgray',
      // borderWidth: 1,
      backgroundColor: '#f0f0f0',
      borderRadius: 20,
      padding: 10,
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      width: '80%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      
    },
    modalInput: {
      borderWidth: 1,
      borderColor: 'lightgray',
      borderRadius: 5,
      padding: 10,
      minHeight: 100,
      marginBottom: 15,
      textAlignVertical: 'top',
    },
    modalButton: {
      backgroundColor: '#363678',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      // width: '100%', 
      alignItems: 'center', 
      marginTop: 10,
      marginBottom: 10,
    },

  });
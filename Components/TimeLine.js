import { View } from 'react-native'
import React from 'react'
import Timeline from 'react-native-timeline-flatlist'
import ActivityCard from './ActivityCard';
import { useNavigation } from '@react-navigation/native';
import Color from '../Styles/Color';
import Style from '../Styles/Style';

//timeline component in the joined screen
export default function TimeLine({data}) {
  //get the navigation object
  const navigation = useNavigation();
  //console.log(data);
  //create a new array with the data from the data array
  let timelineData = data.map(item => ({
    time: item.time,
    title: item.title,
    description: item.description,
    date: item.date,
    ...item
  }));

  //if data.date is in the future, add circle color "royalblue"
  //if data.date is in the past, add circle color "grey"
  timelineData.forEach(item => {
      // Parse time string like "4:16:00 PM"
      const timeRegex = /(\d+):(\d+):00\s(AM|PM)/; 
      const matches = item.time.match(timeRegex);
      
      if (matches) {
          const [_, hours, minutes, period] = matches;
          let hour24 = parseInt(hours);
                    
          // Convert PM times to 24-hour format
          if (period === 'PM') {
              hour24 = hour24 === 12 ? 12 : hour24 + 12;
          } else if (period === 'AM' && hour24 === 12) {
              hour24 = 0;
          }
          //format the time to display in the timeline
          let displayTime = `${hour24}:${minutes}`;
          //save the original time to display in the details screen
          item.originalTime = item.time;

          // Create date in local timezone with correct date
          const [year, month, day] = (item.date || '').split('-');
          const activityDate = new Date(year, month - 1, day);
          activityDate.setHours(hour24, parseInt(minutes), 0);
          
          const now = new Date();

          if (activityDate > now) {
              item.circleColor = Color.royalblue;
              item.time = displayTime;
          } else {
              item.circleColor = Color.gray;
              item.time = displayTime;
          }
      }
  });

  //sort timelineData by date in descending order
  timelineData.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={{
      flex: 1,
      paddingLeft: 10,
    }}>
      {timelineData &&
        <Timeline
          data={timelineData}
          circleSize={20}
          circleColor={item => item.circleColor}
          lineColor="grey"
          renderDetail={(item) => (
            <ActivityCard 
            data={item} 
            cardStyle={Style.timelineCard} 
            favButtonStyle={{
              position: 'absolute',
              top: 220,
              right: 10,
            }}
            onPress={() => navigation.navigate('Details', {activity: item})}/>
          )}
          options={{
            style:{paddingTop:20}
          }}
          isUsingFlatlist={true}
          columnFormat="single-column-left"
          lineWidth={2}
          innerCircle={'dot'}
          separator={false}
          timeContainerStyle={{minWidth:52, marginTop: -5}}
          timeStyle={{textAlign: 'center', backgroundColor:'powderblue', color:'black', padding:5, borderRadius:13}}
          detailContainerStyle={{
            marginBottom: 0,
            paddingLeft: 0,
            marginLeft: 0
          }}
          listViewContainerStyle={{
            marginLeft: 0,
            paddingLeft: 0
          }}
          listViewStyle={{
            paddingLeft: 0,
            marginLeft: 0
          }}
          eventDetailStyle={{
            paddingLeft: 0,
            marginLeft: 0
          }}
          rowContainerStyle={{
            paddingLeft: 0,
            marginLeft: 0
          }}
          eventContainerStyle={{
            paddingLeft: 0,
            marginLeft: 10,
            position: 'relative'
          }}
          circleStyle={{
            marginLeft: 1,
            paddingLeft: 0,
            width: 20,
            height: 20,
            borderRadius: 10,
            position: 'absolute'
          }}
          lineStyle={{
            position: 'absolute',
            left: 9
          }}
        />}
    </View>
  )
}
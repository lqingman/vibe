import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import Timeline from 'react-native-timeline-flatlist'
import ActivityCard from './ActivityCard';
import { useNavigation } from '@react-navigation/native';

export default function TimeLine({data}) {
  const navigation = useNavigation();
  //console.log(data);
  let timelineData = data.map(item => ({
    time: item.time,
    title: item.title,
    description: item.description,
    date: item.date,
    ...item
  }));


  //if data.date is in the future, add circle with text "Upcoming"
  //if data.date is in the past, add circle with text "Past"
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
          let displayTime = `${hour24}:${minutes} ${period}`;

          // Create date in local timezone with correct date
          const [year, month, day] = (item.date || '').split('-');
          const activityDate = new Date(year, month - 1, day);
          activityDate.setHours(hour24, parseInt(minutes), 0);
          
          const now = new Date();

          if (activityDate > now) {
              item.circleColor = "royalblue";
              item.circleText = "Upcoming";
              item.time = displayTime;
          } else {
              item.circleColor = "grey";
              item.circleText = "Past";
              item.time = displayTime;
          }
      }
  });

  //sort timelineData by date in descending order
  timelineData.sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <View style={styles.container}>
      {timelineData &&
        <Timeline
          data={timelineData}
          circleSize={20}
          circleColor={item => item.circleColor}
          lineColor="grey"
          renderDetail={(item) => (
            <ActivityCard data={item} cardStyle={styles.card} onPress={() => navigation.navigate('Details', {activity: item})}/>
          )}
          isUsingFlatlist={true}
          columnFormat="single-column-left"
          lineWidth={2}
          innerCircle={'dot'}
          separator={false}
          timeContainerStyle={{minWidth: 52}}
          detailContainerStyle={{
            marginBottom: 20,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    paddingLeft: 10,
  },
  card: {
    width: "90%",
    backgroundColor: 'white',
    borderRadius: 16,
    //margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
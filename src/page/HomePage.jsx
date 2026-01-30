import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity, Text
} from 'react-native';
import Config from 'react-native-config';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function HomePage() {
  const [mapLat, setMapLat] = useState(0);
  const [mapLong, setMapLong] = useState(0);
  const [currentLat, setCurrentLat] = useState(0);
  const [currentLng, setCurrentLng] = useState(0);
  const [distance, setDistance] = useState('—');

  useEffect(() => {

    getCurrentLocation();

  }, []);
  // !--------- Default Location-----------------
  // const requestLocationPermission = async () => {
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  //     );

  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       console.log('Location permission granted');
  //     } else {
  //       console.log('Location permission denied');
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // };

  // TODO: -------------------fetch current location-----------------------
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log(position);

        setCurrentLat(position?.coords?.latitude);
        setCurrentLng(position?.coords?.longitude);
        setMapLat(position?.coords?.latitude);
        setMapLong(position?.coords?.longitude)
      },
      (error) => {
        console.log("something went wrong!,please check---------", error?.message, error?.code)
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );

  }
  const calculateDistance = async (originLat, originLng, destLat, destLng) => {
    try {
      
      const GOOGLE_MAPS_API_KEY = "AIzaSyA_dgbqqESEGelLH6a1ItkEiZdnVFh9UIw";

      console.log('API KEy', GOOGLE_MAPS_API_KEY);

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&mode=driving&units=metric&key=${GOOGLE_MAPS_API_KEY}`;

      

      const response = await fetch(url);
      const data = await response.json();

      console.log('Distance Matrix response', data);

      if (
        data.status === 'OK' &&
        data.rows?.[0]?.elements?.[0]?.status === 'OK'
      ) {
        return data.rows[0].elements[0].distance.text; 
      }

      return 'N/A';
    } catch (error) {
      console.log('Distance API error ', error);
      return 'Error';
    }
  };



  // MAP TAP HANDLER
  const handleMapPress = async e => {
    if (!currentLat || !currentLng) return;

    const { latitude, longitude } = e.nativeEvent.coordinate;

    setMapLat(latitude);
    setMapLong(longitude);
    setDistance('Calculating…');

    const dist = await calculateDistance(
      currentLat,
      currentLng,
      latitude,
      longitude
    );

    setDistance(dist);
  };



  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: mapLat,
          longitude: mapLong,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={(e) => handleMapPress(e, calculateDistance)}
      >
        <Marker
          coordinate={{ latitude: mapLat, longitude: mapLong }}

        />

      </MapView>

      <View style={styles.currentLocation}>
        <Text style={styles.title}>Location</Text>

        <View style={styles.row}>
          <Text style={styles.label}>📍 Location</Text>
          <Text style={styles.value}>
            {mapLat}, {mapLong}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>      Distance</Text>
          <Text style={styles.value}>{distance || 'Loading…'}</Text>
        </View>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  currentLocation: {
    width: '90%',
    // height: 50,
    backgroundColor: '#111',
    position: 'absolute',
    alignItems: 'start',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 15,
    bottom: 20,
    elevation: 6,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  label: {
    color: '#aaa',
    fontSize: 14,
  },
  value: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
});

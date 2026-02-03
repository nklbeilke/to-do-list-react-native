import { useFonts } from 'exo-font';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

export default function RootLayout(){
    const {loaded} = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    if(!loaded){
        return null;
    }

    return(
        // todas as rotas precisam estar aqui
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false}}/>
            <Stack.Screen name="add" options={{ headerShown: false}}/>
            <Stack.Screen name="edit" options={{ headerShown: false}}/>
            <Stack.Screen name="pomodoro" options={{ headerShown: false}}/>
            <Stack.Screen name="+not-found" options={{ headerShown: false}}/>
        </Stack>
    )
}
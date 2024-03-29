import { writable, get, derived } from "svelte/store";

import type JitsiTrack from "../JitsiTypes/modules/RTC/JitsiTrack";
//this function is responsible for creating a new element that contains a track
//its assumed that each element (component) has a single track
//this contains 2 stores, a element store and a track store

//look for comments above each function for more info

//USAGE: get the element store out of this thing and then bind it into the component
function createElementAndTrackStore() {
	//its either jitsi track or null
	let attachedTrack: JitsiTrack | null = null;

	//these 2 stores are what contains the data for the element (the thing you see)
	//and the track (the actual audio/video track)
	const elementStore = writable(null)
	const trackStore = writable(null)


	//this detaches a track from the current element
	const detach = () => {
		const element = get(elementStore)

		//if attachedTrack exists, detach it
		if (attachedTrack) {
			attachedTrack.detach(element)
		}
	}

	const attach = () => {
		//get the current track and element
		const track = get(trackStore)
		const element = get(elementStore)

		//if it exists and if its not already attached
		if (track && track != attachedTrack) {
			//first detach the current track
			detach()
			attachedTrack = track
			track.attach(element)
		}
	}

	//this is the main track tha contains both the element and the track
	const ElementTrackStore = derived([elementStore, trackStore], ([$element, $track], set) => {
		set({
			element: $element,
			track: $track,
		})
	})

	//the subscribe function returns an unsubscribe function
	const unsubscribe = ElementTrackStore.subscribe((($props) => {
		//if the element is there, attach the track
		if ($props.element && $props.track) {
			attach()
		}
	}))

	return {
		subscribe: ElementTrackStore.subscribe,
		destroy: () => {
			unsubscribe()
			detach()
		},
		setElement: (element) => {
			elementStore.set(element)
		},
		setTrack: (track) => {
			//only set the track if its a different track
			if (track !== get(trackStore)) {
				trackStore.set(track)
			}
		},
	}
}
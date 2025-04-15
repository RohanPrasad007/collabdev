// model/Track.js
export class Track {
    constructor({
        track_id = null,
        name = "Default Track",
        created_at = new Date().toISOString(),
        created_by = null,
        items = []
    }) {
        this.track_id = track_id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.name = name;
        this.created_at = created_at;
        this.created_by = created_by;
        this.items = items;
    }
}
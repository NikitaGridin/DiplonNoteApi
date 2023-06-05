const { User } = require("./User");
const { Track } = require("./Track");
const { Album } = require("./Album");
const { Playlist } = require("./Playlist");
const { Genre } = require("./Genre");
const { Coauthor } = require("./Coauthor");
const { Audition } = require("./Audition");
const { PlaylistTrack } = require("./PlaylistTrack");
const { LibrayAlbum } = require("./LibrayAlbum");
const { LibrayTrack } = require("./LibrayTrack");
const { Subcribe } = require("./Subcribe");
const { LibrayPlaylist } = require("./LibrayPlaylist");
const { Token } = require("./Token");
const { AlbumGenre } = require("./AlbumGenre");

User.hasMany(Album, { onDelete: "cascade" });
Album.belongsTo(User);

Album.hasMany(Track, { onDelete: "cascade" });
Track.belongsTo(Album);

Album.belongsToMany(Genre, { through: AlbumGenre });
Genre.belongsToMany(Album, { through: AlbumGenre });

User.hasOne(Token, { onDelete: "cascade" });
Token.belongsTo(User);

User.belongsToMany(Track, {
  through: Coauthor,
  onDelete: "cascade",
  unique: true,
});
Track.belongsToMany(User, {
  through: Coauthor,
  onDelete: "cascade",
  unique: true,
});

User.hasMany(Coauthor);
Coauthor.belongsTo(User);

Track.hasMany(Coauthor, { as: "CoauthorAlias" });
Coauthor.belongsTo(Track);

User.hasMany(Playlist, { onDelete: "cascade" });
Playlist.belongsTo(User);

Playlist.belongsToMany(Track, { through: PlaylistTrack });
Track.belongsToMany(Playlist, { through: PlaylistTrack });

User.belongsToMany(Track, { through: Audition, unique: true });
Track.belongsToMany(User, { through: Audition, unique: true });

User.hasMany(Audition);
Audition.belongsTo(User);
Track.hasMany(Audition);
Audition.belongsTo(Track);

LibrayAlbum.belongsTo(Album, {
  foreignKey: "album_id",
  onDelete: "CASCADE",
});
Album.hasMany(LibrayAlbum, {
  foreignKey: "album_id",
  onDelete: "CASCADE",
});

User.belongsToMany(Track, {
  through: LibrayTrack,
  onDelete: "cascade",
  unique: true,
});
Track.belongsToMany(User, { through: LibrayTrack, unique: true });

LibrayTrack.belongsTo(Track);
Track.hasMany(LibrayTrack);

User.belongsToMany(Playlist, {
  through: LibrayPlaylist,
  onDelete: "cascade",
  unique: true,
});
Playlist.belongsToMany(User, { through: LibrayPlaylist, unique: true });

LibrayPlaylist.belongsTo(Playlist);
Playlist.hasMany(LibrayPlaylist);

User.belongsToMany(User, {
  through: Subcribe,
  as: "senderId",
  foreignKey: "recipientId",
});

module.exports = {
  User,
  Track,
  Album,
  Playlist,
  Genre,
  Coauthor,
  Audition,
  PlaylistTrack,
  LibrayAlbum,
  LibrayTrack,
  Subcribe,
  LibrayPlaylist,
  Token,
  AlbumGenre,
};


/**
* Last.fm album app by Noora Routasuo
* Built with 
* JavaScript Last.fm API (https://github.com/fxb/javascript-last.fm-api/)
* D3.js (http://d3js.org/)
*/

var artistlimit = 50;
var albumlimit = 50;
var albumlimit_display = 25;
var working = false;

// Set up blink
$(document).ready(function() {
    window.setInterval(blink,600);
});

var apiKey = '7368f1aa0cd2d8defcba395eb5e9fd63';
var apiSecret = '6dbb762ff870c4eb50c50cb1d1a32c1a'
var lastfm = new LastFM({
	apiKey    : apiKey,
	apiSecret : apiSecret,
});

var ok_artists;
var progress_artists;
var ok_albums;
var filtered_albums;
var artist_count;

var album_infos = [];
var artist_infos = [];

// Get initial data (top artists) from Last.fm according to the given username
function fetchData() {
    
    // Clear up any previous chart
	ok_artists = 0;
    progress_artists = 0;
    ok_albums = 0;
    filtered_albums = [];
	showError("");    
    $("#sec_vis").children().remove();
    
	// Get and check username
	var username = $("#username").val();
    if(username.length < 1) {
        stopLoading("Enter a Last.fm username.", "");
        return;
    }
    
    // Get and check artist count
	var count = Number($("#artistcount").val());
    if(count <= 0) {
        stopLoading("Enter a number of top artists to load.", "");
        return;
    }
    artistlimit = count;

	// Load top artists
    working = true;
	var artist_count;
	lastfm.user.getTopArtists(
		{ user: username, limit: artistlimit, api_key: apiKey }, 
		{
			success: function(data) {
				showInfo("Top artists loaded. Loading albums..");
				showArtists(data.topartists, username);
				getArtistInfos( data.topartists, username );
				getArtistAlbums( data.topartists, username );
				return true;
			}, 
			error: function(code, message) {
                stopLoading("", message);
				return false;
			}
	});
}

function cancel() {
    stopLoading('Cancelled.','');
	$("table#vis").remove();
	$("table h2").remove();  
	$("#sec_vis h2").remove();   
	$("#sec_vis p").remove();   
}

// Show artist data and create basic results table
function showArtists(topartists, username) {
	
	if(!topartists.artist) {
        stopLoading("", "No artists found.");
		return;
	}
	
	// Establish table
	$("table#vis").remove();
	$("table h2").remove();
	var visheader = d3.select("#sec_vis").append("h2").text("Chart for " + username);
    var vislegend = d3.select("#sec_vis").append("p").text("Legend:");
    var vislegend_color = vislegend.append("p").text("Color indicates scrobbles by user:");
    vislegend_color.append("span").attr("class", "album-legend no-listens").text("Album with no scrobbles");
    vislegend_color.append("span").attr("class", "album-legend few-listens").text("Album with a few scrobbles");
    vislegend_color.append("span").attr("class", "album-legend many-listens").text("Album with many scrobbles");
    var vislegend_size = vislegend.append("span").text("Size indicates relative popularity (total scrobbles per album / total scrobbles per artist).");
    
	var vistable = d3.select("#sec_vis").append("table").attr("class", "vis").attr("id", "vis");
	var selection = vistable.selectAll("tr").data(topartists.artist);
	
	// Add a row for each artist
	var rows = selection.enter().append("tr").attr("class", "artist");
    
    var cols_playcount = rows.append("td").attr("class", "playcount");
	cols_playcount.text(function(d) {
		return d.playcount;
	});
    
	var cols_name = rows.append("td").attr("class", "artist");
	cols_name.text(function(d) {
		return d.name;
	});
    
    var cols_albums = rows.append("td").attr("class", "albumcol");
	cols_albums.attr("id", function(d) {
        return getAlbumColID(d.name);
    });
}

function getArtistInfos(topartists, username )
{  	        
	// Get infos for each artist one at a time (reduce conflicts)
	var getNextArtist = function(i) {
		if(i >= topartists.artist.length) return false;
		
		var artist = topartists.artist[i];
		if(artistlimit == 1)
		{
			artist = topartists.artist;
			topartists.artist = [];
			topartists.artist[0] = artist;
		}
		
        var artist_id = getArtistID(artist.name);
        if(artist_infos[artist_id])
        {
            // console.log("Using existing infos for artist " + artist.name + " (" + (i + 1) + ") (in progress: " + progress_artists + ")");
            getNextArtist(i + 1);            
        }
        else
        {
            // console.log("Fetching infos for artist " + artist.name + " (" + (i + 1) + ") (in progress: " + progress_artists + ")");
            lastfm.artist.getInfo(
                { artist: artist.name, api_key: apiKey },
                {
                    success: function(data) {
                        if(working)
                        {
                            artist_infos[artist_id] = data.artist;
                            getNextArtist(i + 1);
                        }
                    }, 
                    error: function(code, message) {
                        console.log("Fetching info for artist " + artist.name + " failed.");
                        showError(message + " (Error code: " + code + ")");
                    }
            });
        }
	}
	
	getNextArtist(0);
}

function getArtistAlbums(topartists, username )
{  
	// Get albums for each artist one at a time (reduce conflicts)
	var getNextArtist = function(i) {
        
		if(i >= topartists.artist.length) return false;
		var artist = topartists.artist[i];
        progress_artists++;
		// console.log("Fetching albums for artist " + artist.name + " (" + (i + 1) + ") (in progress: " + progress_artists + ")");
		lastfm.artist.getTopAlbums(
            { artist: artist.name, limit: albumlimit, api_key: apiKey },
            {
                success: function(data) {
                    if(working)
                    {
                        getAlbumInfo(data.topalbums, artist, username);
                        getNextArtist(i + 1);
                    }
                }, 
                error: function(code, message) {
					console.log("Fetching albums info for artist " + artist.name + " failed.");
                    showError(message + " (Error code: " + code + ")");
                }
        });
	}
	getNextArtist(0);
	artist_count = topartists.artist.length;
}

// Fetach additional album info for an artist before displaying albums
function getAlbumInfo(topalbums, artist, username) {
	// console.log("Collecting album info for artist " + artist.name);
	var total_albums = 0;
	if(topalbums && topalbums.album) total_albums = topalbums.album.length;
	
    // Get additional data, one at a time
	var getNextAlbum = function getNext(i) {
        if(!working) {
            console.log("Loading album info interrupted.");
            return;
        }
        
        ok_albums++;
        
		if(i >= total_albums) {
			displayAlbums(topalbums, artist.name);
			return;
		}
        
		var album = topalbums.album[i];
        showLoaded(getProgressPercentage());          
        // console.log("Collecting album info for album " + album.name + "(" + (i + 1) + "/" + (total_albums) + ")");
		
        var filter1 = filterAlbumByBasicData(album, topalbums.album, false);
		if(filter1.length <= 0) 
        {
			lastfm.album.getInfo(
				{ artist: artist.name, album: album.name, autocorrect: 0, username: username, api_key: apiKey },
				{
					success: function(data) {
                        var filter2 = filterAlbumByDetailedInfo( data.album, topalbums.album, artist );
                        if(filter2.length <= 0)
                            album_infos[getAlbumID(album.name)] = data;
                        else
                            registerFiltered(filter2, album, artist.name);                            
                        getNextAlbum(i+1);
					}, 
					error: function(code, message) {
						console.log("Fetching album info for album " + album.name + " by " + artist.name + " failed.");
						showError(message + " (Error code: " + code + ")");
					}
			});
		} else {
            registerFiltered(filter1, album, artist.name);
            getNextAlbum(i+1);
        }
    }
	getNextAlbum(0);
}
 
 // Adds albums of a particular artist to the table (assumes artist rows have been built)
function displayAlbums(topalbums, artist) {
	// console.log("Displaying albums for artist " + artist + "(" + count(albuminfo) + " albums)");
    if(topalbums && count(album_infos) > 0) {
        
        // Filter albums with info
        var displayalbums = [];        
        for (index = 0; index < Math.min(topalbums.album.length, albumlimit_display); ++index) {
            var name = topalbums.album[index].name;
            var id = getAlbumID(name);
            if(album_infos[id])
            {
                displayalbums[displayalbums.length] = topalbums.album[index];
            }
        }
        
        // Sort albums according to release year
        displayalbums.sort(function(a, b) {
            a_year = 0;
            if(album_infos[getAlbumID(a.name)])
                a_year = getYearFromReleaseDate(album_infos[getAlbumID(a.name)].album.releasedate);
            b_year = 0;
            if(album_infos[getAlbumID(b.name)])
                b_year = getYearFromReleaseDate(album_infos[getAlbumID(b.name)].album.releasedate);
            return a_year - b_year;
        });
        
        // Display albums in table
        var colid = "#" + getAlbumColID(artist);
        var td = d3.select(colid).selectAll("span").data(displayalbums);
        var albumDiv = td.enter().append("div");
        var links = albumDiv.append("a");
        var yearSpan = links.append("span").attr("class", "span-year");
        var artistSpan = links.append("span").attr("class", "span-name");
        
        yearSpan.text(function(d) {
            var name = d.name;
            var id = getAlbumID(name);
            var info = album_infos[id].album;
            var year = getYearFromReleaseDate(info.releasedate);
            var url = info.url;
            if(year.length < 1) return "[n/a]";
            return year;
        });
        
        artistSpan.text(function(d) {
            return d.name;
        });
        
        links.attr("href", function(d) {
            return d.url;
        });
        
        albumDiv.attr("title", function(d) {
            return d.name;
        });
        
        albumDiv.attr("style", function(d) {
            var name = d.name;
            var id = getAlbumID(name);
            var info = album_infos[id].album;
            var playcount = info.playcount;
            var artist_total_playcount = artist_infos[getArtistID(artist)].stats.playcount;
            var w = 1.8 + (playcount / artist_total_playcount) * 30;
            return "width: " + w + "em";
        });
        
        var manylimit = 15;
        
        albumDiv.attr('class', function(d) {
            var name = d.name;
            var id = getAlbumID(name);
            var info = album_infos[id].album;
            var listens = info.userplaycount;
            if(listens > manylimit) return "album many-listens";
            else if(listens > 0) return "album few-listens";
            else	return "album no-listens";
        });
        
    }
    
	ok_artists++;            
    progress_artists--;
    if(topalbums)
        ok_albums -= topalbums.album.length;
        
	var percentage = getProgressPercentage();
	if(percentage >= 100)
    {
		stopLoading( "Done.", "" );
    }
	else
		showLoaded(percentage);
}

// Various helper functions

function getProgressPercentage() {
    var artistVal = (ok_artists / artist_count);
    var albumVal = progress_artists > 0 ? ok_albums / (albumlimit * progress_artists) : 0;
    if(albumVal > 1) albumVal = 1;
    albumVal = albumVal * (1 / artist_count);
    
    var percentage = Math.floor( (artistVal + albumVal) * 100 );
    
    if(percentage > 100)
    {
    	console.log("Illegal percentage: " + percentage + " | " + artistVal + " + " + albumVal + " = " + "(" + ok_artists +" / " + artist_count + ")  +  (" + ok_albums +" / (" + albumlimit + " * " + progress_artists + ")) * (1 / " + artist_count+ ")");
    	percentage = 100;
    }
    
    return percentage;
}

function getAlbumColID(artistname) {
    return "albums-" + getArtistID(artistname);
}

function getAlbumID(albumname) {
    return "album-" + albumname.toLowerCase().replace(/ /g, "");
}

function getArtistID(artistname) {
    return "artist-" + artistname.toLowerCase().replace(/[ &\.\/\']/g, "");
}


function getYearFromReleaseDate(releasedate) {
	var date = releasedate;
	if(typeof date == 'undefined' || (date + " ").length < 3 || !date) 
		date = "6 Apr ????, 00:00";
	var year = date.replace(/,.*/, '').trim().replace(/^\s+|\s+$/g,'');
	year = year.substr(year.length-4, 4);
	return year;
}

function cleanAlbumName(name) {
    var cleanname = name.trim().toLowerCase().replace(/\(.*/g, "").trim();
    cleanname = cleanname.replace(/disc/g, "");
    cleanname = cleanname.replace("&", "and");
    cleanname = cleanname.replace("vol.", "volume");
    cleanname = cleanname.replace("pt.", "part");
    cleanname = cleanname.replace("/", "");
    cleanname = cleanname.replace("\\", "");
    cleanname = cleanname.replace("|", "");
    cleanname = cleanname.replace("-", "");
    cleanname = cleanname.replace("'", "");
    cleanname = cleanname.replace("´", "");
    cleanname = cleanname.replace(":", "");
    cleanname = cleanname.replace("1", "i");
    cleanname = cleanname.replace("2", "ii");
    cleanname = cleanname.replace("3", "iii");
    cleanname = cleanname.replace("4", "iv");
    cleanname = cleanname.replace("5", "v");
    cleanname = cleanname.replace("!", "");
    cleanname = cleanname.replace("?", "");
    cleanname = cleanname.replace(/\./g, "");
    cleanname = cleanname.replace("-", "");
    cleanname = cleanname.replace(",", "");
    cleanname = cleanname.trim().replace(/^the /g, "");
    cleanname = cleanname.trim().replace(/ ep$/g, "");
    cleanname = cleanname.trim().replace(/ gold$/g, "");
    
	var soundtrackStrings = "/original soundtrack| ost|\(ost\)|soundtrack/g";
	if(cleanname.replace(soundtrackStrings, "").trim().length > 0)
		cleanname = cleanname.replace(soundtrackStrings, "");
		
    cleanname = cleanname.replace(/[àáâãäå]/g,"a");
    cleanname = cleanname.replace(/[èéêẽë]/g,"e");
    cleanname = cleanname.replace(/[ìíîĩï]/g,"i");
    cleanname = cleanname.replace(/[òóôõö]/g,"o");
    cleanname = cleanname.replace(/[ùúûũä]/g,"u");
    cleanname = cleanname.replace(/[\(\)]/g,"");

    cleanname = cleanname.replace(/ /g, ""); 
    
    return cleanname.trim();
}

// Filter albums based on basic data to avoid duplicates, deluxe editions etc, true = skippable album
function filterAlbumByBasicData(album, allalbums, skipDuplicateSearch) {
    if(!album) return "empty";
    
    // Data available at this point
    var images = album.image;
	var name = album.name;
	var playcount = album.playcount;        // album plays in total 
	
    // Immediate reject rules
    if(playcount < 50) return "few listeners";
	if(name.toLowerCase().replace(/rarities/g,"").length < name.length) return "rarities";
	if(name.toLowerCase().replace(/remaster/g,"").length < name.length) return "remaster";
	if(name.toLowerCase().replace("special edition","").length < name.length) return "edition";
	if(name.toLowerCase().replace("deluxe edition","").length < name.length) return "edition";
	if(name.toLowerCase().replace(/live ?[1234567890\- ]+/g,"").length < name.length) return "anon-live";
	if(name.toLowerCase().replace(/[\(\[]disc ?[1234].*[\)\]]/g,"").length < name.length) return "disc-n";
	if(name.toLowerCase().replace(/[\(\[]cd ?[1234].*[\)\]]/g,"").length < name.length) return "disc-n";
    
    // Reject only if a cleaner-sounding album exists on the list (for example: reject "Album (bonus tracks)" if "Album" exists
    var suspicious = false;
	if(name.toLowerCase().indexOf("bonus") != -1) suspicious = true;
	if(name.toLowerCase().indexOf("disc") != -1) suspicious = true;
	if(name.toLowerCase().indexOf("deluxe") != -1) suspicious = true;
	if(name.toLowerCase().indexOf("live") != -1) suspicious = true;
	if(name.toLowerCase().indexOf("demos") != -1) suspicious = true;
	if(name.replace(/[\.,-\/#!\?$%\^&\*;:{}=\-_`~()12345]/g,"").length < name.length) suspicious = true;
    
    if(suspicious && skipDuplicateSearch)
		return "suspicious";
	
	if(skipDuplicateSearch)
		return "";
    	
    // Check for duplicates
    var simplename = cleanAlbumName(name);
    for(var i = 0; i < allalbums.length; i++) {
        var otheralbum = allalbums[i];
        if(otheralbum.mbid === album.mbid) continue; // same album
        var simplename2 = cleanAlbumName(otheralbum.name);
        if(simplename2 === simplename) {
        	var otherfilter = filterAlbumByBasicData(otheralbum, allalbums, true );
        	if(suspicious && otherfilter.length <= 0)
            	return "duplicate";
          	if(Number(album.playcount) < Number(otheralbum.playcount))
          		return "duplicate";
        }
    }
    
	return "";
}

function filterAlbumByDetailedInfo( albuminfo, allalbums, artist ) {
    var album_listeners = albuminfo.listeners;
    var album_releasedate = albuminfo.releasedate;
    var album_playcount = albuminfo.playcount;
    var album_tracks = albuminfo.tracks;
    
    var artist_playcount = artist.playcount; // artist plays by user
	var artist_total_playcount = artist_infos[getArtistID(artist.name)].stats.playcount;
	
    if(album_playcount / artist_total_playcount < 0.0007) return "few relative playcount";
    
    return "";
}

function registerFiltered( reason, album, artistName ) {
    if(album)
    {
        if(!filtered_albums[reason])
            filtered_albums[reason] = [];
        
        var artistID = getArtistID(artistName);
        if(!filtered_albums[reason][artistID])
            filtered_albums[reason][artistID] = [];
            
        filtered_albums[reason][artistID][filtered_albums[reason][artistID].length] = album.name;
        
        // console.log("Filtered album [" + reason + "]: " + album.name + " (" + album.playcount + " scrobbles by all users)");
    }        
}

function stopLoading( info, error ) {
    showInfo( info );
    showError(error);
    console.log("Filtered albums:");
    console.log(filtered_albums);
    working = false;
}

function showError(msg) {
	if(msg.length > 0)
		$("#errormsg").text("Error: " + msg);
	else
		$("#errormsg").text("");
}

function showInfo(msg) {
	if(msg.length > 0)
		$("#infomsg").text(msg);
	else
		$("#infomsg").text("");
}

function showLoaded(percentage) {
    showInfo((percentage).toFixed(0) + "% loaded");
}

function count(arr) {
  counter = 0; 
  for(var elem in arr) counter++; 
  return counter;
}

function toggle(elem) {
    if(elem.hasClass("hide")) {
        elem.removeClass("hide");
    } else {
        elem.addClass("hide");
    }
}

function hideAll(elems) {
    elems.addClass("hide");
}

function blink() {
    var elm = document.getElementById('infomsg');
    if(working) {
        if (elm.style.color == 'rgb(30, 30, 30)')
          elm.style.color = 'rgb(140, 140, 140)';
        else
          elm.style.color = 'rgb(30, 30, 30)';
    } else {
      elm.style.color = 'rgb(30, 30, 30)';    	
    }
}

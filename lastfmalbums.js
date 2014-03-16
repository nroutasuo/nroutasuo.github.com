
/**
* Last.fm album app by Noora Routasuo
* Built with 
* JavaScript Last.fm API (https://github.com/fxb/javascript-last.fm-api/)
* D3.js (http://d3js.org/)
*/

var artistlimit = 50;
var albumlimit = 50;
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
var artist_count;

// Get initial data (top artists) from Last.fm according to the given username
function fetchData() {
    
    // Clear up any previous chart
	ok_artists = 0;
    progress_artists = 0;
    ok_albums = 0;
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
				return true;
			}, 
			error: function(code, message) {
                stopLoading("", message);
				return false;
			}
	});
}

// Show artist data and then fetch albums
function showArtists(topartists, username) {
	
	if(!topartists.artist) {
        stopLoading("", "No artists found.");
		return;
	}
	
	// Establish table
	$("table#vis").remove();
	$("table h2").remove();
	var visheader = d3.select("#sec_vis").append("h2").text("Chart for " + username);
    var vislegend = d3.select("#sec_vis").append("p").text("Legend: ");
    vislegend.append("span").attr("class", "album-legend no-listens").text("Album with no listens");
    vislegend.append("span").attr("class", "album-legend few-listens").text("Album with a few listens");
    vislegend.append("span").attr("class", "album-legend many-listens").text("Album with many listens");
    
	var vistable = d3.select("#sec_vis").append("table").attr("class", "vis").attr("id", "vis");
	var selection = vistable.selectAll("tr").data(topartists.artist);
	
	// Add a row for each artist
	var rows = selection.enter().append("tr").attr("class", "artist");
    
    //var cols_playcount = rows.append("td").attr("class", "playcount");
	//cols_playcount.text(function(d) {
	//	return d.playcount + " plays";
	//});
    
	var cols_name = rows.append("td").attr("class", "artist");
	cols_name.text(function(d) {
		return d.name;
	});
    
    var cols_albums = rows.append("td").attr("class", "albumcol");
	cols_albums.attr("id", function(d) {
        return getAlbumColID(d.name);
    });
    
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
                        getAlbumInfo(data.topalbums, artist.name, username);
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
	// console.log("Collecting album info for artist " + artist);
	var albuminfo = [];
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
			displayAlbums(topalbums, albuminfo, artist);
			return;
		}
        
		var album = topalbums.album[i];
        showLoaded(getProgressPercentage());          
        // console.log("Collecting album info for album " + album.name + "(" + (i + 1) + "/" + (total_albums) + ")");
		
		if(!filterAlbum(album, topalbums.album)) 
        {
			lastfm.album.getInfo(
				{ artist: artist, album: album.name, autocorrect: 0, username: username, api_key: apiKey },
				{
					success: function(data) {
                        albuminfo[getAlbumID(album.name)] = data;
                        getNextAlbum(i+1);
					}, 
					error: function(code, message) {
						console.log("Fetching album info for album " + album.name + " by " + artist + " failed.");
						showError(message + " (Error code: " + code + ")");
					}
			});
		} else {
            getNextAlbum(i+1);
        }
    }
	getNextAlbum(0);
}
 
 // Adds albums of a particular artist to the table (assumes artist rows have been built)
function displayAlbums(topalbums, albuminfo, artist) {
	// console.log("Displaying albums for artist " + artist + "(" + count(albuminfo) + " albums)");
    if(count(albuminfo) > 0) {
        
        // Filter albums with info
        var displayalbums = [];        
        for (index = 0; index < topalbums.album.length; ++index) {
            var name = topalbums.album[index].name;
            var id = getAlbumID(name);
            if(albuminfo[id])
            {
                displayalbums[displayalbums.length] = topalbums.album[index];
            }
        }
        
        // Sort albums according to release year
        displayalbums.sort(function(a, b) {
            a_year = 0;
            if(albuminfo[getAlbumID(a.name)])
                a_year = getYearFromReleaseDate(albuminfo[getAlbumID(a.name)].album.releasedate);
            b_year = 0;
            if(albuminfo[getAlbumID(b.name)])
                b_year = getYearFromReleaseDate(albuminfo[getAlbumID(b.name)].album.releasedate);
            return a_year - b_year;
        });
        
        // Display albums in table
        var colid = "#" + getAlbumColID(artist);
        var td = d3.select(colid).selectAll("span").data(displayalbums);
        var spans = td.enter().append("span");
        
        spans.text(function(d) {
            var name = d.name;
            var id = getAlbumID(name);
            var info = albuminfo[id].album;
            var year = getYearFromReleaseDate(info.releasedate);
            var url = info.url;
            if(year.length < 1) return "????";
            return year;
        });
        spans.attr("title", function(d) {
            return d.name;
        });
        
        var manylimit = 15;
        
        spans.attr('class', function(d) {
            var name = d.name;
            var id = getAlbumID(name);
            var info = albuminfo[id].album;
            var listens = info.userplaycount;
            if(listens > manylimit) return "album many-listens";
            else if(listens > 0) return "album few-listens";
            else	return "album no-listens";
        });
    }
    
	ok_artists++;            
    progress_artists--;
    if(topalbums)
        ok_albums -= count(topalbums.album);
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
    var albumVal = albumVal * (1 / artist_count);
    return Math.round( (artistVal + albumVal) * 100 );
}

function getAlbumColID(artistname) {
    return "albums-" + artistname.toLowerCase().replace(/[ \.\/\']/g, "");
}

function getAlbumID(albumname) {
    return "album-" + albumname.toLowerCase().replace(/ /g, "");
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
    cleanname = cleanname.replace(/disc/g, " ");
    cleanname = cleanname.replace("&", "and");
    cleanname = cleanname.replace("/[-|]/g", "");
    cleanname = cleanname.replace(/  /g, " ");
    //console.log(cleanname);
    return cleanname.trim();
}

// Filter albums based on basic data to avoid duplicates, deluxe editions etc, true = skippable album
function filterAlbum(album, allalbums) {
    if(!album) return true;
    
	var name = album.name;
	var listeners = album.listeners;
    var releasedate = album.releasedate;
	
    // Immediate reject rules
    if(listeners < 10) return true;
	if(name.replace(/Rarities/g,"").length < name.length) return true;
    if(releasedate == "undefined") return true;
    
    // Reject only if a cleaner-sounding album exists on the list (for example: reject "Album (disc 1)" if "Album" exists
    var suspicious = false;
	if(name.toLowerCase().indexOf("bonus") != -1) suspicious = true;
	if(name.toLowerCase().indexOf("disc") != -1) suspicious = true;
	if(name.toLowerCase().indexOf("deluxe") != -1) suspicious = true;
	if(name.toLowerCase().indexOf("remaster") != -1) suspicious = true;
	if(name.replace(/[\.,-\/#!\?$%\^&\*;:{}=\-_`~()12345]/g,"").length < name.length) suspicious = true;
    
    if(suspicious) {
        var simplename = cleanAlbumName(name);
        for(var i = 0; i < allalbums.length; i++) {
            var otheralbum = allalbums[i];
            if(otheralbum.name === album.name) continue; // same album
            var simplename2 = cleanAlbumName(otheralbum.name);
            if(simplename2 === simplename) {
                //console.log("Rejected: " + simplename + " (" + album.name + ") === " + simplename2 + "(" + otheralbum.name + ")");
                return true;
            }
        }
    }
    
	return false;
}

function stopLoading( info, error ) {
    showInfo( info );
    showError(error);
    //working = false;
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
    if(working) {
        var elm = document.getElementById('infomsg');
        if (elm.style.color == 'rgb(30, 30, 30)')
          elm.style.color = 'rgb(140, 140, 140)';
        else
          elm.style.color = 'rgb(30, 30, 30)';
    }
}

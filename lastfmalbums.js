
/**
* Last.fm album app by Noora Routasuo
* Built with 
* JavaScript Last.fm API (https://github.com/fxb/javascript-last.fm-api/)
* D3.js (http://d3js.org/)
*/

var artistlimit = 30;
var albumlimit = 25;
var working = false;

$(document).ready(function() {	
	/* Create a cache object */
	//var cache = new LastFMCache();
	//alert(cache);
    window.setInterval(blink,600);
});

var apiKey = '7368f1aa0cd2d8defcba395eb5e9fd63';
var apiSecret = '6dbb762ff870c4eb50c50cb1d1a32c1a'
var lastfm = new LastFM({
	apiKey    : apiKey,
	apiSecret : apiSecret,
	//cache     : cache
});

var ok_artists;
var artist_count;
var userpercentage = 100/artistlimit*1;
var artistpercentage = 100/artistlimit*2;

// Get initial data (top artists) from Last.fm according to the given username
function fetchData() {
    
    // Clear up any previous chart
	ok_artists = 0;
	showError("");    
    $("#sec_vis").children().remove();
    
	// Get and check username
	var username = $("#username").val();
    if(username.length < 1) {
        showInfo("Enter a Last.fm username.");
        return;
    }

	// Load top artists
    working = true;
	var artist_count;
	lastfm.user.getTopArtists(
		{ user: username, limit: artistlimit, api_key: apiKey }, 
		{
			success: function(data) {
				showLoaded(userpercentage+artistpercentage);
				showArtists(data.topartists, username);
				return true;
			}, 
			error: function(code, message) {
				showError(message); // + " (Error code: " + code + ")");
                showInfo("");
				return false;
			}
	});
}

// Show artist data and then fetch albums
function showArtists(topartists, username) {
	
	if(!topartists.artist) {
		showError("No artists found.");
		return;
	}
    
	showLoaded(userpercentage);
	
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
    var cols_playcount = rows.append("td").attr("class", "playcount");
	cols_playcount.text(function(d) {
		return d.playcount + " plays";
	});
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
		//console.log("Fetching albums for artist " + artist.name);
		lastfm.artist.getTopAlbums(
            { artist: artist.name, limit: albumlimit, api_key: apiKey },
            {
                success: function(data) {
                    getAlbumInfo(data.topalbums, artist.name, username);
					getNextArtist(i + 1);
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
	//console.log("Collecting album info for artist " + artist);
	var albuminfo = [];
	var total_albums = 0;
	if(topalbums && topalbums.album) total_albums = topalbums.album.length;
	
    // Get additional data, one at a time
	var getNextAlbum = function getNext(i) {
		if(i >= total_albums) {
			displayAlbums(topalbums, albuminfo, artist);
			return;
		}
		var album = topalbums.album[i];
		
		if(filterAlbum(album, topalbums.album)) {
			// console.log("Skipping album " + album.name + " by " + artist);
		} else {
			lastfm.album.getInfo(
				{ artist: artist, album: album.name, autocorrect: 0, username: username, api_key: apiKey },
				{
					success: function(data) {
                        var releasedate = $.trim(data.album.releasedate);
                        if(typeof releasedate == 'undefined' || (releasedate + " ").length < 3 || !releasedate) {
                            albuminfo[getAlbumID(album.name)] = data;
                            getNextAlbum(i+1);
                        } else {
                            albuminfo[getAlbumID(album.name)] = data;
                            getNextAlbum(i+1);
                        }
					}, 
					error: function(code, message) {
						console.log("Fetching album info for album " + album.name + " by " + artist + " failed.");
						showError(message + " (Error code: " + code + ")");
					}
			});
		}
    }
	getNextAlbum(0);
}
 
 // Adds albums of a particular artist to the table (assumes artist rows have been built)
function displayAlbums(topalbums, albuminfo, artist) {
	// console.log("Displaying albums for artist " + artist + "(" + count(albuminfo) + " albums)");
    if(count(albuminfo) > 0) {
	
        // Sort albums according to release year
        var displayalbums = topalbums.album;
        displayalbums.sort(function(a, b) {
            a_year = 0;
            if(albuminfo[getAlbumID(a.name)])
                a_year = getYearFromReleaseDate(albuminfo[getAlbumID(a.name)].album.releasedate);
            b_year = 0;
            if(albuminfo[getAlbumID(b.name)])
                b_year = getYearFromReleaseDate(albuminfo[getAlbumID(b.name)].album.releasedate);
            return a_year - b_year;
        })
        
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
        
        var manylimit = 12;
        
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
	var percentage = Math.round(ok_artists / artist_count * (100 - userpercentage + artistpercentage)) + userpercentage + artistpercentage;
	if(percentage >= 100)
		showInfo("Done.");
	else
		showLoaded(percentage);
}

// Various helper functions

function getAlbumColID(artistname) {
    return "albums-" + artistname.toLowerCase().replace(/ /g, "");
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
    cleanname = cleanname.replace("&", "and");
    cleanname = cleanname.replace("-", "");
    cleanname = cleanname.replace(/  /g, " ");
    return cleanname.trim();
}

// Filter albums based on basic data to avoid duplicates, deluxe editions etc, true = skippable album
function filterAlbum(album, allalbums) {
	var name = album.name;
	var listeners = album.listeners;
    var releasedate = album.releasedate;
	
    // Immediate reject rules
    if(listeners < 10) return true;
    
    // Reject only if a cleaner-sounding album exists on the list (for example: reject "Album (disc 1)" if "Album" exists
    var suspicious = false;
	if(name.toLowerCase().indexOf("bonus") != -1) suspicious = true;
	else if(name.toLowerCase().indexOf("disc") != -1) suspicious = true;
	else if(name.toLowerCase().indexOf("deluxe") != -1) suspicious = true;
	else if(name.toLowerCase().indexOf("remaster") != -1) suspicious = true;
	else if(name.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"").length < name.length) suspicious = true;
    
    if(suspicious) {
        var simplename = cleanAlbumName(name);
        for(var i = 0; i < allalbums.length; i++) {
            var otheralbum = allalbums[i];
            if(otheralbum.name === album.name) continue; // same album
            var simplename2 = cleanAlbumName(otheralbum.name);
            if(simplename2 === simplename) {
                console.log("Rejected: " + simplename + " (" + album.name + ") === " + simplename2 + "(" + otheralbum.name + ")");
                return true;
            }
        }
    }
    
	return false;
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

/**
* Timeline of events related to education, work and hobbies.
* Shaded and rounded boxes are short (less than one month) events.
* Click on any event for more information.
*/

// Constants
final int MARGIN = 8;

final int TEXTH = 11;
final int TEXTH_TITLE = 14;
final int LINEMARGIN = 3;
final int LINEH = TEXTH + LINEMARGIN;
final int LINEH_TITLE = TEXTH_TITLE + LINEMARGIN;

final color COLOR_MAIN      = color(30);
final color COLOR_SELECTION = color(100);
final color COLOR_GRID      = color(200);
final color COLOR_BG        = color(250);
final color COLOR_BG2       = color(200);

PFont FONT_MAIN;


// Variables
Timeline timeline;
InfoBox infobox;


// Main
void setup() {
  size(775, 360);
  FONT_MAIN = loadFont("verdana.ttf");
  textSize(TEXTH);
  
  boolean horizontal = true;
  int timeline_x = horizontal ? 0 : 0;
  int timeline_y = horizontal ? 0 : 0;
  int timeline_l = horizontal ? width : height;
  this.timeline = 
    new Timeline(timeline_x, timeline_y, 
    timeline_l, height, horizontal);
  this.timeline.maxyear = 2013;
  this.timeline.minyear = 1988;
  
  this.infobox = new InfoBox();
  
  this.addEvents();
  frameRate(12);
}

void draw() {
  background(COLOR_BG);
  this.timeline.draw();
  this.infobox.draw();
}

void mouseClicked() {
  float x = mouseX;
  float y = mouseY;
  EventVis sel = this.timeline.getEvent(x, y);
  
  if(this.infobox.curr_event != null) {
    if(sel != null && sel.equals(this.infobox.curr_event))
      this.infobox.showEvent(null);
    if(this.infobox.occupies(x, y)) {
      if(this.infobox.onCloseIcon(x, y))
        this.infobox.showEvent(null);
      else
        return;
    }
  }  
  this.infobox.showEvent(sel);
}

void addEvents() {
  /*
  this.timeline.addEvent(
    1988, 8, 1988, 8, EventCategory.OTHER,
   "Birth", "Helsinki, Finland", 
   "Born August 2, 1988", 1);
  */
   
  // Schools
  this.timeline.addEvent(
    1995, 8, 2001, 6, EventCategory.EDUCATION,
   "Elementary School", "Espoo, Finland", 
   "", 1);
  this.timeline.addEvent(
    2001, 8, 2004, 6, EventCategory.EDUCATION,
   "Junior High School", "Espoo, Finland", 
   "", 1);
  this.timeline.addEvent(
    2004, 8, 2007, 6, EventCategory.EDUCATION,
   "Ressu Upper Secondary School", 
   "Helsinki, Finland", 
   "Matriculation examinations (high school final exams) " +
   "passed with top grades (Finnish, English, Swedish and " +
   "history and mathematics in the top 5% (Laudatur) and " +
   "French and German in the top 20% (Eximia cum laude approbatur))." +
   "", 1);
  this.timeline.addEvent(
    2007, 9, 2011, 12, EventCategory.EDUCATION,
   "Aalto University", "Bc Degree",
   "Bachelor of Science (Technology), Degree Programme in Information Networks\n" +
   "Grade average: 4.09/5.00\n" +
   "Major: Media Engineering\n" +
   "Minor: Interaction and Media \n" +
   "Bachelor's Thesis: \"Selection of the modelling unit in statistical language models\” (in Finnish)", 1);
  this.timeline.addEvent(
    2011, 12, 2013, 7, EventCategory.EDUCATION,
   "Aalto University", "MSc Degree", 
   "Master of Science (Technology), Degree Programme in Information Networks\n" +
   "Expected graduation: August 2013\n"+
   "Major: Media\n" +
   "Minor: Human and Interaction\n" +
   "Master's Thesis: \"Exploratory visualization of inter-organizational networks\"", 1);
   
   // Other education   
  this.timeline.addEvent(
    2004, 7, 2004, 7, EventCategory.EDUCATION,
   "EF", "English language course", 
   "EF (Education First) English language course in Dublin, Ireland.", 3);
  this.timeline.addEvent(
    2009, 10, 2009, 10, EventCategory.EDUCATION,
   "TOEFL", "English proficiency test", 
   "TOEFL iBT English proficiency test. Score: 115/120", 2);
  this.timeline.addEvent(
    2010, 10, 2011, 8, EventCategory.EDUCATION,
   "Tohoku University", "JYPE exchange program", 
   "Exchange year at Tohoku University in Sendai, Japan. " +
   "Studies in computer science and Japanese. Independent " +
   "research training at the Communication Science Lab.", 2);
  this.timeline.addEvent(
    2013, 7, 2013, 7, EventCategory.EDUCATION,
   "BEST", "Summer course", 
   "BEST (Board of European Students of Technology) " +
   "summer course on game programming in Chisinau, Moldova.", 3);
   
   // Work history
  this.timeline.addEvent(
    2006, 7, 2006, 7, EventCategory.WORK,
   "Amica", "Kitchen assistant", 
   "Three-week job training at a canteen.\n" +
   "", 1);
  this.timeline.addEvent(
    2007, 3, 2007, 9, EventCategory.WORK,
   "SOL Pesulapalvelut", "Sales assistant", 
   "Sales assistant at a chemicla laundry.\n" +
   "\nAccomplishments: Customer service and everyday maintenance of the laundry.", 1);
  this.timeline.addEvent(
    2008, 5, 2008, 9, EventCategory.WORK,
   "MediaPex", "Subscription Handler", 
   "Subscription handler at a telemarketing company.\n"+
   "\nAccomplishments: Communication across the organization, database maintenace.", 1);
  this.timeline.addEvent(
    2009, 9, 2010, 2, EventCategory.WORK,
   "Aalto University", "Course Assistant", 
   "Course assistant on an extensive basic programming course in Java.\n" +
   "\nAccomplishments: Leading a small problem-based learning group, teaching programming", 1);
  this.timeline.addEvent(
    2010, 5, 2010, 9, EventCategory.WORK,
   "SITO", "Software Developer", 
   "Software developer at an established Finnish engineering company.\n" +
   "\nAccomplishments: Implementing a new web-based version of an existing desktop product", 1);
  this.timeline.addEvent(
    2011, 3, 2011, 8, EventCategory.WORK,
   "LSC Sendai", "Language Teacher", 
   "Part-time job teaching Finnish at a language school in Sendai, Japan.\n" +
   "\nAccomplishments: A learner's perspective to my mother tongue, planning lessons", 1);
  this.timeline.addEvent(
    2012, 5, 2012, 9, EventCategory.WORK,
   "Comptel", "Junior Software Engineer", 
   "Junior software engineer at an international telecommunications company.\n"+
   "\nAccomplishments: Developing a new program independently, picking up several new technologies, becoming comfortable on the command line.", 1);
  this.timeline.addEvent(
    2013, 1, 2013, 7, EventCategory.WORK,
   "Aalto University", "Research Assistant", 
   "Research assistant at the Department of Media Technology at Aalto University " +
   "while working on my Master's Thesis on Information Visualization.\n"+
   "\nAccomplishments: Independent research on information visualization, academic writing", 1);
   
   // Odd jobs
  this.timeline.addEvent(
    2010, 1, 2013, 13, EventCategory.WORK,
   "Ensemble Norma", "Web Master", 
   "Webmaster of the Wordpress-based site of the acapella group Ensemble Norma.\n" +
   "\nAccomplishments: Web design, working closely together with a customer.", 2);
   
   // Other
  this.timeline.addEvent(
    2005, 7, 2005, 7, EventCategory.OTHER,
   "Prometheus Camp Association", "Camp Leader", 
   "Junior camp leader at a week-long politically and religiously " +
   "unaffiliated coming-of-age camp in southern Finland.\n" +
   "\nAccomplishments: Teamwork, leadership", 1);
  this.timeline.addEvent(
    2006, 6, 2006, 6, EventCategory.OTHER,
   "Prometheus Camp Association", "Camp Leader", 
   "Junior camp leader at a week-long politically and religiously " +
   "unaffiliated coming-of-age camp in Rovaniemi, Finland.\n" +
   "\nAccomplishments: Teamwork, leadership", 1);
  this.timeline.addEvent(
    2009, 1, 2012, 7, EventCategory.OTHER,
   "Prometheus Camp Association", "www working group", 
   "Member of www working group tasked with collecting requirements for," +
   "and working with an outside contractor to build, the association " +
   "a new website and databases.\n" +
   "\nAccomplishments: Seeing the customer's perspective in a big IT project, usability research", 1);
  this.timeline.addEvent(
    2004, 8, 2007, 6, EventCategory.OTHER,
   "Nyrpeä Elitisti (magazine)", "Editor", 
   "Editor of one of the high school's magazines, Nyrpeä Elitisti. Editor-in-chief in 2006-2007.\n" +
   "\nAccomplishments: Creative writing, planning magazine content, organizing activities", 2);
  this.timeline.addEvent(
    2012, 9, 2012, 9, EventCategory.OTHER,
   "Viljami Kankaanpää", "Webmaster", 
   "Web master for a Wordpress based communal elections site.\n" +
   "Accomplisments: Wordpress layout implementation", 2);
   
   
}
// Information about a single "event" on the Timeline
public class Event {
  
  TimePoint start;
  TimePoint end;
  int category;
  int priority;
  
  String title;
  String subtitle;
  String desc;
  
  Event(TimePoint start, TimePoint end, 
    String title, String subtitle, String desc, 
    int category, int priority) {
    this.start = start;
    this.end = end;
    this.title = title;
    this.subtitle = subtitle;
    this.desc = desc;
    this.category = category;
    this.priority = priority;
  }
  
  int getPriority() {
    return this.priority;
  }
  
  String toString() {
    return this.start + "-" + this.end + " " + this.title;
  }
  
}
// An enumeration of Event types on the Timeline
static class EventCategory {
  
  public static final int WORK = 0;
  public static final int EDUCATION = 1;
  public static final int OTHER = 2;

  public static String toString(int category) {
    switch(category) {
      case WORK:      return "Work";
      case EDUCATION: return "Education";
      default:        return "Other";
    }
  }
  
  public static color getColor(int category) {
    switch(category) {
      case WORK:      return color(209, 121, 48);
      case EDUCATION: return color(76, 138, 170);
      default:        return color(76, 170, 86);
    }
  }
}
// A "row" on the Timeline containing all the Events of a type
public class EventContainer {
  
  Timeline timeline;
  int category;
  ArrayList<EventVis> eventboxes;

  float width;
  float pos;
  
  
  EventContainer(Timeline timeline, int category, float w, float pos) {
    this.timeline = timeline;
    this.category = category;
    this.width = w;
    this.pos = pos;
    this.eventboxes = new ArrayList<EventVis>();
  }
  
  void addEvent(Event e) {
    boolean main = e.getPriority() < 2;
    float h = main ? this.width / 3*2 : this.width/3;
    h = h - LINEMARGIN*2;
    float wpos = this.pos + LINEMARGIN;
    if(main && this.pos < timeline.year_y1) {
      wpos = this.pos + this.width/3;
      h += LINEMARGIN;
    }
    if(!main && this.pos > timeline.year_y1) {
      wpos = this.pos + this.width/3*2;
      h += LINEMARGIN;
    }
   
    float epos_1 = this.timeline.getX(e.start);
    float epos_2 = this.timeline.getX(e.end);
    
    float x = epos_1;
    float y = wpos;
    float w = epos_2 - epos_1;
    if(!this.timeline.horizontal) {
      x = wpos;
      y = epos_1;
      w = h;
      h = epos_2 - epos_1;
    }
    
    EventVis vis = new EventVis(e, x, y, w, h);
    this.eventboxes.add(vis);
  }
  
  void draw() {
    color c = EventCategory.getColor(this.category);
    noFill();
    noStroke();
    if(this.timeline.horizontal)
      rect(this.timeline.x + this.timeline.header_l, this.pos, 
      this.timeline.length - this.timeline.header_l, this.width);
    else
      rect(this.pos, this.timeline.y, this.timeline.width, this.length);
    for(EventVis e : this.eventboxes) {
      e.drawEvent();
    }
  }
  
}
// The box of a single "event" on the TimeLine
public class EventVis {

  Event event;
  float x, y, w, h;


  EventVis(Event e, float x, float y, float w, float h) {
    this.event = e;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    if (this.event.start.diff(this.event.end) == 0) {
      this.w = 7;
      this.h = h - MARGIN;
      this.y += MARGIN/2;
    }
  }

  void drawEvent() { 
    boolean instant = this.event.start.diff(this.event.end) == 0;
    float round = 0; 
    if (instant) {
      round = 5;
    }

    // Rectangle
    color c = EventCategory.getColor(this.event.category);
    stroke(c);
    strokeWeight(1);
    if (this.occupies(mouseX, mouseY)) {
      fill(c, 60);
    } 
    else {
      if (instant) fill(c, 100);
      else fill(255, 80);
    }
    rect(this.x, this.y, this.w, this.h, round);

    // Text
    fill(COLOR_MAIN);
    textAlign(LEFT, TOP);
    textFont(FONT_MAIN, TEXTH);
    float txtx = this.x + LINEMARGIN;
    float txty = this.y + LINEMARGIN;
    float txtw = this.w - LINEMARGIN*2;
    float txth = this.h - LINEMARGIN;

    int lines = this.drawTitle(this.event.title, 
    txtw, txth, txtx, txty);

    // Subtitle
    fill(COLOR_MAIN, 200);
    lines = this.drawTitle(this.event.subtitle, 
    txtw, txth, txtx, txty+lines*LINEH);
  }

  private int drawTitle(String title, float txtw, float txth, 
  float txtx, float txty) {
    String[] titleparts = title.split(" ");
    String line_s = "";
    int lines = 1;
    float linew = 0;
    // int lines = ceil(textWidth(this.event.title) / txtw);
    for (int i = 0; i < titleparts.length; i++) {
      String word = titleparts[i];
      float ww = textWidth(word);
      if (linew + ww <= txtw) {
        line_s = line_s + word + " ";
        linew = textWidth(line_s);
      } 
      else {
        if (line_s.length() > 0) {
          if (linew <= txtw)
            text(line_s, txtx, txty + (lines-1)*LINEH);
          else
            text(line_s, txtx, txty + (lines-1)*LINEH, txtw, LINEH);
          lines++;
          if (txty + lines*LINEH > txth) return lines-1;
        }
        linew = textWidth(word);
        line_s = word + " ";
      }
    }
    if (line_s.length() > 0) {
      if (linew <= txtw) {
        text(line_s, txtx, txty + (lines-1)*LINEH);
      } 
      else {
        text(line_s, txtx, txty + (lines-1)*LINEH, txtw, LINEH);
      }
    }
    return lines;
  }

  boolean occupies(float x, float y) {
    return x >= this.x && x <= this.x+this.w && y >= this.y && y <= this.y+this.h;
  }
}

public class InfoBox {
  
  Event curr_event;
  float xpos, ypos;
  float w, h;
  float icons;
  float iconx;
  
  
  InfoBox() {
    this.ypos = MARGIN;
    this.h = height - MARGIN*2;
    this.icons = TEXTH;
    this.w = 250;
  }
  
  void showEvent(EventVis e) {
    if(e != null) {
      this.curr_event = e.event;
      float xmid = (e.x + e.x + e.w)/2.0;
      this.xpos = xmid - this.w/2;
      if(this.xpos + this.w > width)
        this.xpos = width - this.w - MARGIN; 
      else if(this.xpos < MARGIN) {
        this.xpos = MARGIN;
      }     
      this.iconx = this.xpos + this.w - this.icons - MARGIN;
    } else {
      this.curr_event = null;
    }
  }
  
  void draw() {
    if(this.curr_event != null) {
      
      // Shadow
      fill(COLOR_GRID, 15);
      noStroke();
      for(int swidth = 0; swidth <= MARGIN; swidth++) {
        rect(this.xpos - swidth, this.ypos - swidth, 
             this.w + swidth*2, this.h + swidth*2);
      }
      
      // Background
      fill(COLOR_BG);
      stroke(EventCategory.getColor(this.curr_event.category));  
      strokeWeight(2);    
      rect(this.xpos, this.ypos, this.w, this.h);
      
      // Close x
      strokeWeight(4);
      stroke(COLOR_GRID);
      if(this.onCloseIcon(mouseX, mouseY))
        stroke(COLOR_MAIN);
      line(this.iconx, MARGIN*2, this.iconx + this.icons, MARGIN*2+this.icons);
      line(this.iconx, MARGIN*2 + this.icons, this.iconx+this.icons, MARGIN*2);
      
      // Text
      fill(COLOR_MAIN);
      textFont(FONT_MAIN, TEXTH_TITLE);
      float y = MARGIN + LINEMARGIN;
      text(this.curr_event.title, 
        this.xpos + LINEMARGIN*2, y, 
        this.w - LINEMARGIN*4, height - MARGIN*2 - LINEMARGIN*2);
      y += LINEH_TITLE;
      textFont(FONT_MAIN, TEXTH_TITLE);
      text(this.curr_event.subtitle, 
        this.xpos + LINEMARGIN*2, y, 
        this.w - LINEMARGIN*4, height - MARGIN*2 - LINEMARGIN*2);
      y += LINEH_TITLE;
      String time = this.curr_event.start;
      if(this.curr_event.start.diff(this.curr_event.end) > 0)
        time += " - " + this.curr_event.end;
      text(time, 
        this.xpos + LINEMARGIN*2, y, 
        this.w - LINEMARGIN*4, height - MARGIN*2 - LINEMARGIN*2);

      fill(COLOR_SELECTION);
      y += LINEH_TITLE*2;
      text(this.curr_event.desc, 
        this.xpos + LINEMARGIN*2, y, 
        this.w - LINEMARGIN*4, height - MARGIN*2 - LINEMARGIN*2);
    }
  }
  
  boolean occupies(float x, float y) {
    return x >= this.xpos && x <= this.xpos+this.w && 
           y >= this.ypos && y <= this.ypos+this.h;
  }
  
  boolean onCloseIcon(float x, float y) {
    return (x >= this.iconx && x <= this.iconx+this.icons &&
            y >= MARGIN*2 && y <= MARGIN*2+this.icons);
    
  }
  
}
// A point in time, specified by year and month
class TimePoint implements Comparable<TimePoint> {
  
  int y;
  int m;
  
  TimePoint() {
    this(year(), month());
  }
  
  TimePoint(int y, int m) {
    this.y = y;
    this.y = y;
    this.m = m;
  }
  
  TimePoint(TimePoint start, int offset_y, int offset_m) {
    this.y = start.y + offset_y;
    this.m = start.m;
    for(int i = 0; i < offset_m; i++) {
      this.m++;
      if(this.m > 12) {
        this.m = 1;
        this.y++;
      }
    }
  }
  
  boolean after(TimePoint other) {
    return this.compareTo(other) > 0;
  }
  
  boolean before(TimePoint other) {
    return this.compareTo(other) < 0;
  }
  
  int diff(TimePoint t) {
    // Establish order (matters for months)
    TimePoint first = this;
    TimePoint last = t;
    if(this.after(t)) {
      first = t;
      last = this;
    }
    
    // Year diff
    int diff = 0;
    int yeardiff = abs(this.y - t.y);
    diff = yeardiff*12;
    
    // Month diff
    int monthdiff = (last.m - first.m);
    //println(this + ".diff(" + t + "):");
    //println("monthdiff: " + monthdiff);
    diff += monthdiff;
    //println("diff: " + diff);
    
    return diff;
  }
  
  int compareTo(TimePoint other) {
    if(other.y != this.y) return this.y - other.y;
    return this.m - other.m;
  }
  
  String toString() {
    return this.y + "/" + nf(this.m, 2);
  }
  
}
// The main TimeLine class, handling both visual and non-visual elements
public class Timeline {
  
  ArrayList<Event> events;
  float x, y;
  float length;
  float width;
  float header_l;
  
  EventContainer education_container;
  EventContainer work_container;
  EventContainer other_container;
  EventContainer[] containers;
  
  int minyear, maxyear;
  float year_y1;  // y position of the year display
  float year_y2;
  boolean horizontal;
  
  Timeline(int x, int y, int length, int w, boolean horizontal) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.width = w;
    this.horizontal = horizontal;
    this.events = new ArrayList<Event>();
    this.minyear = 0;
    this.maxyear = 0;
    this.header_l = this.horizontal ? 75 : LINEH_TITLE;
    
    // Containers and space division
    float y_w = this.horizontal ? LINEH_TITLE + LINEMARGIN : textWidth("2000") + LINEMARGIN*2;
    float cat_w = (this.width - y_w) / 3;
    
    float pos = horizontal ? this.y : this.x;
    this.education_container = 
      new EventContainer(this, EventCategory.EDUCATION, cat_w, pos);
    pos += cat_w;
    
    this.year_y1 = int(pos);
    this.year_y2 = int(pos + y_w);
    pos += y_w;
    
    this.work_container = 
      new EventContainer(this, EventCategory.WORK, cat_w, pos);
    pos += cat_w;
    this.other_container = 
      new EventContainer(this, EventCategory.OTHER, cat_w, pos);
    this.containers = new EventContainer[] { this.education_container,
      this.work_container, this.other_container };

  }
  
  void addEvent(int start_y, int start_m, int end_y, int end_m,
    int cat, String title, String subtitle, String desc, int priority) {
    TimePoint start = new TimePoint(start_y, start_m);
    TimePoint end = new TimePoint(end_y, end_m);
    Event e = new Event(start, end, title, subtitle, desc, cat, priority);
    
    if(start_y < this.minyear || this.minyear == 0)
      this.minyear = start_y;
    if(end_y > this.maxyear)
      this.maxyear = end_y;  
    
    this.events.add(e);
    switch(cat) {
      case EventCategory.EDUCATION:
        this.education_container.addEvent(e);
        break;
      case EventCategory.WORK:
        this.work_container.addEvent(e);
        break;
      case EventCategory.OTHER:
        this.other_container.addEvent(e);
        break;
    }
  }
  
  void draw() {
    float w = this.horizontal ? this.length : this.width;
    float h = this.horizontal ? this.width : this.length;
    float textw = textWidth("2000");
    
    // Draw box
    /*
    strokeWeight(1);
    stroke(COLOR_GRID);
    noFill();
    rect(this.x, this.y, w, h);
    */
    
    // Draw years
    this.drawYears();

    // Header
    float x;
    float y;
    float cont_w;
    float cont_h;
    for(int i = 0; i < this.containers.length; i++) {
      EventContainer container = this.containers[i];
      fill(COLOR_BG2);
      strokeWeight(2);
      stroke(COLOR_BG);
      cont_w = this.horizontal ? this.header_l : container.width;
      cont_h = this.horizontal ? container.width : header_l;
      x = this.horizontal ? this.x : container.pos;
      y = this.horizontal ? container.pos : this.y;
      rect(int(x), int(y), int(cont_w), int(cont_h));
      fill(COLOR_MAIN);
      textFont(FONT_MAIN, TEXTH_TITLE);
      text(EventCategory.toString(container.category), x, y, cont_w, cont_h);
      if(this.horizontal) popMatrix();
    }
    cont_w = this.horizontal ? this.header_l : this.year_y2 - this.year_y1;
    cont_h = this.horizontal ? this.year_y2 - this.year_y1 : header_l;
    x = this.horizontal ? this.x : this.year_y1;
    y = this.horizontal ? this.year_y1 : this.y;
    fill(COLOR_BG2);
    rect(x, y, cont_w, cont_h);
    fill(COLOR_MAIN);
    textFont(FONT_MAIN, TEXTH);
    text("Year", x, y-LINEMARGIN, cont_w, cont_h+LINEMARGIN);
    
    // Containers and events
    this.work_container.draw();
    this.education_container.draw();
    this.other_container.draw();
  }
  
  void drawYears() {
    float w = this.horizontal ? this.length : this.width;
    float h = this.horizontal ? this.width : this.length;
    textFont(FONT_MAIN, TEXTH);
    textAlign(CENTER, CENTER);
    
    strokeWeight(1);
    stroke(COLOR_BG);
    for(int y = this.maxyear; y >= this.minyear; y--) {
      float year_x1 = this.getX(new TimePoint(y, 1));
      float year_x2 = this.getX(new TimePoint(y+1, 1));
      boolean shorten = year_x2 - year_x1 - 2*LINEMARGIN < textWidth(y);
      
      fill(COLOR_BG2);
      if((mouseX >= year_x1 && mouseX < year_x2) || (mouseX > 0 && mouseX <= this.x)) {
        textSize(height-MARGIN*4);
        fill(COLOR_BG2, 60);
        text(y, this.header_l + this.length/2 - MARGIN*2, height/2);
        textSize(TEXTH);
        fill(COLOR_BG2, 180);
      }
      if(this.horizontal) 
        rect(year_x1, this.year_y1, year_x2 - year_x1, this.year_y2 - this.year_y1);
      else
        rect(this.year_y1, year_x1, this.year_y2 - this.year_y1, year_x2 - year_x1);

      String year = y+"";
      if(!shorten) {
        fill(COLOR_MAIN);
        if(this.horizontal) {
          text(year, year_x1, this.year_y1 - 2, year_x2 - year_x1, 18);
        } else
          text(year, year_y1, year_x1, this.year_y2 - this.year_y1, year_x2 - year_x1);
      }
    }
    
    // Horizontal lines
    /*
    stroke(COLOR_MAIN);
    if(this.horizontal) {
      line(this.x, year_y1, this.x + w, year_y1);
      line(this.x, year_y2, this.x + w, year_y2);
    } else {
      line(year_y1, this.y, year_y1, this.y + h);
      line(year_y2, this.y, year_y2, this.y + h);
    }
    */
  }
  
  // Gets the position of the given TimePoint on this timeline
  // along the timeline axis (x if horizontal, y if vertical)
  float getX(TimePoint point) {
    float minyearw = 2;
    float start_pos = (this.horizontal ? this.x : this.y);
    start_pos += this.header_l;
    float end_pos = start_pos + this.length;
    end_pos -= this.header_l;
    
    if(point.y < this.minyear) return start_pos;
    if(point.y > this.maxyear) return end_pos;
    if(point.y == this.minyear) 
      return start_pos + point.m*minyearw/12;
    
    TimePoint start = new TimePoint(this.minyear, 1);
    TimePoint second = new TimePoint(this.minyear +1, 1);
    TimePoint end = new TimePoint(this.maxyear, 9);
    
    float pw = 3.5;
    float pos = pow(float(point.diff(second)), pw) / pow(float(end.diff(second)), pw);
    pos = start_pos + minyearw + pos * (this.length - this.header_l - minyearw);
    return round(pos);
  } 
  
  EventVis getEvent(float x, float y) {
    for(int i = 0; i < this.containers.length; i++) {
      EventContainer c = this.containers[i];
      for(EventVis e : c.eventboxes) {
        if(e.occupies(x, y)) return e;
      }
    }
  }
  
}



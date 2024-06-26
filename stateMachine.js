/* *** Code belongs to Eugenio Pace and is taken from https://github.com/eugeniop/simplestatemachine  *** */

/*
 A very simple state machine
 StateMachine has states identified with a name. Each state has 
 entries that handle some event. 
 An event selector determines whether an entry should handle 
 it or not. The selector is user supplied.
 An action is typically associated with an entry and is executed when 
 there's a match for the event.
 The 'any' selector is a match always regardless of what event is present.
 The 'default' is meant as a generic handler of events that don't switch states. It is 
 like an 'any' and a 'then' that returns the same state it is defined on.

  @eugenio_pace
*/

///StateEntry
function stateEntry(state,selector)
{
  this.selector = selector;
  this.state = state;
  this.action = function() { return this.state.name; }
}

//Defines what to do when an event is matched
stateEntry.prototype.then = function(action)
{
  this.action = action;
  return this.state;
}

///State
function state(name)
{
  this.stateName = name;
  this.entries = [];
}

//Defines the selector to match an event
state.prototype.when = function( selector ) 
{
  var entry = new stateEntry(this,selector);
  this.entries[this.entries.length] = entry;
  return entry;
}

//Matches any event
state.prototype.any = function() 
{
  return this.when(function(){return true;});
}

//Default handler for any event, that keeps machine in the
//same state. 
state.prototype.default = function(action) 
{
  var thisState = this.stateName;
  this.any()
      .then(function(e){
                action(e);
                return thisState;
            });
}

//Processes a new event. If no matches are found, does nothing.
state.prototype.process = function( event )
{
  for( x = 0; x < this.entries.length; x++ )
    if( this.entries[x].selector(event) )
      return this.entries[x].action(event);
}

//Creates a new stateMachine
function stateMachine(name)
{
  this.name = name;
  this.states = [];
  this.currentState = "";
}

//Defines a new state in a stateMachine
stateMachine.prototype.state = function(stateName)
{
    var st = new state(stateName);   
    this.states[stateName] = st;
    return st;
}

//Main entry point for event processing
stateMachine.prototype.process = function(event)
{
  this.currentState = this.states[this.currentState].process(event);
}

module.exports = stateMachine;
import { Router } from '@angular/router';
import { Player } from './../../domain/player';
import { SelectionService } from './../../services/selections/selection.service';
import { PlayerService } from './../../services/players/player.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  displayedColumns: string[] =  ['name', 'surname', 'yearOfBirth','selection'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  isDesc = false;
  orderAge = false;
  dateConvert;
  isEditing = false;
  selectionsApi=null;
  playersApi=null;
  searchedPlayers=null;
  addPlayerForm: FormGroup;
  newPlayer: Player;
  selectedPlayer: Player;
  searchText = '';
  playersWithSelection: null;
  playersWithoutSelection: null;
  constructor(private playerService: PlayerService, private selectionService: SelectionService, private route: Router) { }

  ngOnInit(): void {
    this.playerService.getPlayers().subscribe((data) =>{
      this.playersApi = this.searchedPlayers = data;
      this.searchedPlayers = new MatTableDataSource(this.playersApi);
      this.searchedPlayers.sort = this.sort;
      this.searchedPlayers.paginator = this.paginator;
      // this.playersWithSelection = this.searchedPlayers.filter(function(player) {
      //   return player['selection']!=null;
      // });
      // this.playersWithoutSelection = this.searchedPlayers.filter(function(player) {
      //   return player['selection']==null;
      // });
      
    }, error => {
      console.log(error);
    });

    this.selectionService.getSelections().subscribe((data) =>{
      this.selectionsApi = data;
      console.log(this.selectionsApi);
    }, error => {
      console.log(error);
    });

    this.addPlayerForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.minLength(3)]),     
      lastName: new FormControl(null,  [Validators.required, Validators.minLength(3)]),
      birthDate: new FormControl(null, Validators.required),
      selectionID: new FormControl(null)
  })

  

}

addPlayer(){
this.newPlayer = {
  name: this.addPlayerForm.get('firstName').value,
  surname: this.addPlayerForm.get('lastName').value,
  birthDate: this.addPlayerForm.get('birthDate').value,
  selectionID: this.addPlayerForm.get('selectionID').value!=null ? this.addPlayerForm.get('selectionID').value : 0
}
this.playerService.addPlayer(this.newPlayer).subscribe(data => {
  this.updateList();

  this.resetForm();
});
;

}

onAddPlayer(){
  if(this.addPlayerForm.valid){
    this.addPlayer();
   // location.reload();
  }
}

applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.searchedPlayers.filter = filterValue.trim().toLowerCase();
  if (this.searchedPlayers.paginator) {
    this.searchedPlayers.paginator.firstPage();
  }
}


checkSelection(player: Player): boolean{
  if(player.selectionID!=null){
    return true;
  }
  return true;
}

onPlayer(p)
{
  this.dateConvert = p.birthDate.slice(0,10);
  this.isEditing = true;
  this.addPlayerForm.setValue({
    firstName: p.name,
    lastName: p.surname,
    birthDate: this.dateConvert,
    selectionID: p.selectionID!=null ? p.selectionID : 0
  })
  
  this.selectedPlayer = p;
}

sortString(info){
  this.isDesc = !this.isDesc;

  let direction = this.isDesc ? 1: -1;

  this.searchedPlayers.sort(function (a,b) {

    if (a[info] < b[info]) {
      return -1 * direction;
    }
    else if(a[info] > b[info]){
      return 1* direction;
    }
    else {
      return 0;
    }
  })
}

sortAge(){
  if(this.orderAge)
  {
   this.searchedPlayers.sort((a,b) => this.getYear(a.birthDate) - this.getYear(b.birthDate));
  }
  else{
    this.searchedPlayers.sort((a,b) => this.getYear(b.birthDate) - this.getYear(a.birthDate));

  }
  this.orderAge = !this.orderAge;
}

getYear(birthDate): number{
  this.dateConvert = birthDate.slice(0,4);
return this.dateConvert;
}

onUpdatePlayer(){
  this.newPlayer = {
    name: this.addPlayerForm.get('firstName').value,
    surname: this.addPlayerForm.get('lastName').value,
    birthDate: this.addPlayerForm.get('birthDate').value,
    selectionID: this.addPlayerForm.get('selectionID').value
  }
  this.playerService.updatePlayer(this.selectedPlayer.playerID,this.newPlayer).subscribe(data=> {
    this.updateList();
    this.resetForm();
    

  });

 

}

onSearch(){
  this.searchedPlayers = this.playersApi.filter((value, index) => {
    let joined = value.name + ' ' + value.surname;
    
    if (joined.toLowerCase().includes(this.searchText.toLowerCase())) {
      return value;
    }
  });
}

onExit(){

this.resetForm();
}

onDeletePlayer(){
  this.playerService.deletePlayer(this.selectedPlayer.playerID).subscribe(data=> {
    this.updateList();
        this.resetForm();
    // location.reload();

  })
  
}

resetForm(){
  this.addPlayerForm = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.minLength(3)]),     
    lastName: new FormControl(null,  [Validators.required, Validators.minLength(3)]),
    birthDate: new FormControl(null, Validators.required),
    selectionID: new FormControl(null)
  });
  this.isEditing = false;
}

updateList(){
  this.playerService.getPlayers().subscribe((data) =>{
    this.playersApi = this.searchedPlayers = data;
    
    this.searchedPlayers = new MatTableDataSource(this.playersApi);
    this.searchedPlayers.sort = this.sort;
    this.searchedPlayers.paginator = this.paginator;
    
  }, error => {
    console.log(error);
  });
}
}

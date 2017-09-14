//Shows tooltip on top of glyphs
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
});
//Types of confirm keys for tagsinput
$('input').tagsinput({
     confirmKeys: [188, 32, 39],
});
//Show/hide button "select top file"
jQuery(document).ready(function(){
        jQuery('#hideshow').on('click', function(event) {
             jQuery('#topology_input').toggle('show');
             $(this).find('span:first').toggleClass('glyphicon-chevron-down').toggleClass('glyphicon-chevron-up');
        });
    });
jQuery(document).ready(function(){
        jQuery('#hideshow1').on('click', function(event) {
             jQuery('#trajectory_input').toggle('show');
             $(this).find('span:first').toggleClass('glyphicon-chevron-down').toggleClass('glyphicon-chevron-up');
        });
    });
jQuery(document).ready(function(){
        jQuery('#hideshow2').on('click', function(event) {
             jQuery('#resOffset').toggle('show');
             jQuery('#output_name').toggleClass("col-xs-offset-2 col-xs-5").toggleClass("col-xs-12")
        });
    });
// make hbonds, pi-stacking and SASA always checked
jQuery(document).ready(function(){
  jQuery('#HBonds').attr("checked",true);
  jQuery('#Pi').attr("checked",true);
  jQuery('#SASA').attr("checked",true);
})
/////////////////////////////////////////////////////////////////////////////////
//Functions for showing and selecting topology file

//Ajax call to determine the files and folders
function list_contents(folder, callback){
  // List contents of folder, then run callback function
  request = $.ajax({
    url:"/ls",
    data : JSON.stringify({cwd:folder}),
    method: "POST",
    dataType: 'json',
    success: function(d){callback(d)}
  })
}

topology_path = "/Users/lauradomicevica/"
topology_filename = ""

//Alowed filetypes - need to update
var top_filetypes = ["pdb","gro"]

//function that finds and displays topology files and all folders
function update_topology_path(new_path,filetype){
  list_contents(new_path, function(d){
    topology_path = d.cwd;
    $("#topology_browser .folder_path").html(topology_path)
    var subfiles_container = $("#topology_browser .subfiles")
    subfiles_container.html("<li  class='folder disabled list-group-item list-group-item-success' >"+topology_path+"</li>");
    for (file of d.files){
      var new_element = undefined;
        if (top_filetypes.includes(file.path.split(".").pop())===true){
          new_element_class = "file";
          new_element = $("<li class='  "+new_element_class+" list-group-item' ></li>");
          new_element.html(file.path.split("/").pop());
        }
        if (file.isdir && file.path.split("/").pop().startsWith(".") == false){
          new_element_class = "folder";
          new_element = $("<li class='  "+new_element_class+" list-group-item list-group-item-info' ></li>");
          new_element.html(file.path);
      }
      if (new_element){
        new_element.click(function(e){
          class_type = $(e.currentTarget).attr("class");
          //if click on folders (which are blue) move to that folder and see its contents (done
          // by update_topology_path())
          if (class_type.includes("folder")===true){
            update_topology_path($(e.currentTarget).html())
          } else {
            //Click on filename - make it green (selected) and save the filename for further use
            topology_filename = $(e.currentTarget).html()
            $("li").removeClass("list-group-item-success")
            $(e.currentTarget).addClass("list-group-item-success");
            //close filebrowser after a selection has been made
            $('#topology_input').toggle('hide')
            //save the full path in a hidden input form
            subfiles_container = $("#topology_browser #topology_path_hidden").val(
              topology_path+"/"+topology_filename
            )
            //Trigger ligand determination
            setHiddenTopFile(topology_path+"/"+topology_filename)
            //Show just the filename to the user
            subfiles_container = $("#topology_browser #topology_path").val(
              topology_filename
            )
          }
        })
      }
      subfiles_container.append(new_element)
    }

  })
}

update_topology_path("",top_filetypes);



//////////////////////////////////////////////////////////////////////////////////
//Trajectory file browser

var trajectory_path = "/"
var trajectory_filename = ""
var trajectory_filenames = []

var traj_filetypes = ["xtc"];

var filenames = $("#trajectory_browser #trajectory_path").tagsinput('items')

function update_trajectory_path(new_path,filetype){
  list_contents(new_path, function(d){
    trajectory_path = d.cwd;
    basepath = d.basedir;
    var files = d.files;
    $("#trajectory_browser .folder_path").html(trajectory_path)
    var subfiles_container = $("#trajectory_browser .subfiles")
    subfiles_container.html("<li  class='folder disabled list-group-item list-group-item-success' >"+trajectory_path+"</li>");
    for (file of d.files){
      var new_element = undefined;
      if (traj_filetypes.includes(file.path.split(".").pop())===true){
        new_element_class = "file";
        new_element = $("<li class='  "+new_element_class+" list-group-item' ></li>");
        new_element.html(file.path.split("/").pop());
      }
      if (file.isdir && file.path.split("/").pop().startsWith(".") == false){
          new_element_class = "folder";
          new_element = $("<li class='  "+new_element_class+" list-group-item list-group-item-info' ></li>");
          new_element.html(file.path);
      }
      if (new_element){
        new_element.click(function(e){
          class_type = $(e.currentTarget).attr("class");
          if (class_type.includes("folder")===true){
            update_trajectory_path($(e.currentTarget).html())
          } else {
            if (class_type.includes("list-group-item-success")===true){
              $(e.currentTarget).removeClass("list-group-item-success")
              $("#trajectory_browser #trajectory_path").tagsinput('remove',trajectory_path.split(d.basedir).pop()+"/"+$(e.currentTarget).html())
            } else {
              $(e.currentTarget).addClass("list-group-item-success");
              trajectory_filenames.push($(e.currentTarget).html())
              $("#trajectory_browser #trajectory_path").tagsinput('add',trajectory_path.split(d.basedir).pop()+"/"+$(e.currentTarget).html())
            }
          }


        })
      }
      subfiles_container.append(new_element)
    }

  })
}


update_trajectory_path("",traj_filetypes);

/////////////////////////////////////////////////////////////////////////////////
//Ligand selector

//Ajax call for determining the ligands present in the topology file
function list_ligands(topology_file,callback){
 // List ligands
 request = $.ajax({
   url:"/ligandls",
   data : JSON.stringify({top_file:topology_file}),
   method: "POST",
   dataType: 'json',
   success: function(d){callback(d)}
 })
}

//The list_ligands() function is triggered when a topology file is selected on the
//topology file browser causing a change of #topology_path_hidden value
function setHiddenTopFile(myValue) {
   $('#ligand_input').css('display','block')
   var ligand_container = $("#ligand_selector .ligands")
   //cleaning the container before appending new ligands - otherwise old values get appended as well
   ligand_container.empty()
   ligand_container.html("<li href='#' class='list-group-item active'><h5 class='list-group-item-heading'>Select ligand molecule</h5></li>")
   list_ligands(myValue, function(d){
     for (ligand of d.ligands){
       var new_element = undefined;
       var new_element = $("<li class='list-group-item'></li>");
       new_element.text(ligand.resid+ligand.resname+"_"+ligand.segid)
       new_element.attr("value",[ligand.resid,ligand.segid])
       if (new_element){
         new_element.click(function(e){
           $("li").removeClass("list-group-item-success")
           $(e.currentTarget).addClass("list-group-item-success");
           $("#ligand_selection").val($(e.currentTarget).attr("value"))
         })
       }
       ligand_container.append(new_element)

     }

   });
$('#topology_path_hidden').val(myValue)
            .trigger('change');
  }

$(document).ready(function () {
    $('#trajectory_path')
        .change(function (e) {
          if ($("#trajectory_path").tagsinput("items").length !== 0){
            $("#RMSF").removeAttr("disabled")
          } else {$("#RMSF").attr("disabled",true);
            }

        })
        .end()
      });




//The waiting page
function preloading(){
    var x = document.forms["myForm"]["topology_path"].value;
    var y = document.forms["myForm"]["output_name"].value;
    var errors = ""

    if (x == "") {
        errors = errors.concat("Input topology must be selected. \n");
    }
    if (y == ""){
        errors = errors.concat("Output name must be specified. \n");
    }
    list_contents("", function(d){
      for (var file of d.files){
        if (file.isdir){
          var dirToCheck = file.path.split(d.cwd+"/").pop()
          if (dirToCheck == y){
            errors = errors.concat("This output already exists. Please choose another output name. \n")
          }
        }
      }
      if (errors != ""){
        alert(errors);
        //window.location.href = "/contact";
        location.reload(false);
      }
    })


    $("#loading").show();
    $("#content").hide();
}

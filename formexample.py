from flask import Flask, redirect, url_for, render_template, request, flash, jsonify,send_from_directory,current_app
from forms import Lintools_Input
import MDAnalysis
import os
from os.path import expanduser
import json
from lintools.lintools import Lintools

app = Flask(__name__, static_url_path='')
app.secret_key = 'development key'
app.config["CACHE_TYPE"] = "null"
global output_name

output_name=""
@app.route('/js/<path:filename>')
def serve_static(filename):
    root_dir = os.getcwd()
    return send_from_directory(os.path.join(root_dir, 'static', 'js'), filename)




@app.route('/ls', methods= ['POST'])
def ls_route():
    if request.method == "POST":
        request_data = request.get_json(force=True)
        cwd = request_data.get("cwd", os.getcwd())
        base_dir = expanduser("~")
        if cwd == "":
            cwd = os.getcwd()
        file_list = os.listdir(cwd)
        sendable_file_list = []
        base, _ = os.path.split(cwd)
        if base != "":
            sendable_file_list.append({"path" : base, "isdir": True})
        for f in file_list:
            full_path = os.path.join(cwd, f)
            sendable_file_list.append({
                "path" : full_path,
                "isdir" : os.path.isdir(full_path)
            })
        return jsonify(**{"cwd" : cwd, "basedir": base_dir, "files": sendable_file_list})

@app.route('/ligandls', methods= ['POST'])
def ligandls_route():
    if request.method == "POST":
        request_data = request.get_json(force=True)
        top_file = request_data.get("top_file")
        explorable_ligands = []
        ligand_list = find_ligand_name(top_file)
        for f in ligand_list.values():
            explorable_ligands.append({
                "resname" : f.resnames[0],
                "resid" : f.resids[0],
                "segid": f.segids[0]
            })
        return jsonify(**{"ligands": explorable_ligands})

def find_ligand_name(top_data):
    """Users select a ligand to analyse from a numbered list."""
    gro = MDAnalysis.Universe(top_data)
    list_of_non_ligands=["SOL","NA","CL","HOH","ARG","LYS","HIS","ASP","GLU","SER","THR", "ASN","GLN","PHE","TYR","TRP","CYS","GLY","PRO","ALA","VAL","ILE","LEU","MET"]
    potential_ligands={}
    i=0
    for residue in gro.residues:
        if residue.atoms.resnames[0] not in list_of_non_ligands:
            if residue.atoms.altLocs[0]==str("") or  residue.atoms.altLocs[0]==None:
                potential_ligands[i]=residue.atoms
            else:
                #Deal with ligands that have alternative locations
                altloc = str(residue.atoms.altLocs[1])
                resid = residue.atoms.resids[0]
                new_residue = residue.select_atoms("resid "+str(resid)+" and altloc "+str(altloc))
                potential_ligands[i] = new_residue
            i+=1
    return potential_ligands

@app.route('/contact', methods = ['GET', 'POST'])
def contact():
   base_dir = expanduser("~")
   global form
   form = Lintools_Input()

   if request.method == 'POST':
      traj_files = request.form["trajectory_path"].rsplit(",")
      global output_name
      output_name = request.form["output_name"]
      inputs = request.form
      global lintools
      print inputs
      print traj_files,str(2)
      print [base_dir+x for x in traj_files if traj_files!=[u'']]
      lintools = Lintools(inputs["topology_path_hidden"],[base_dir+x for x in traj_files if traj_files!=[u'']],None,[inputs["ligand_selection"].rsplit(",")[0],inputs["ligand_selection"].rsplit(",")[1]],inputs["residueOffset"],inputs["distance_cutoff"],[None],[None],[None],inputs["analysis_cutoff"],"amino",inputs["output_name"])
      lintools.save_files()
      lintools.data_input_and_res_time_analysis()
      lintools.analysis_of_prot_lig_interactions([False if "HBonds" in inputs else True][0],
                                                 [False if "Pi" in inputs else True][0],
                                                 [False if "SASA" in inputs else True][0],
                                                 [False if "RMSF" in inputs else True][0],
                                                 [False if "SaltBridges" in inputs else True][0])
      lintools.plot_residues()
      lintools.draw_figure()
      lintools.remove_files()
      return redirect(url_for('input'))
   elif request.method == 'GET':
      return render_template('contact.html', form = form)

@app.route('/input', methods=['GET', 'POST'])
def input():
    return render_template('input_success.html', form=form, output_name=output_name)

@app.route('/<path:svgFile>.svg')
def serve_content(svgFile):
    print "output:",output_name
    return file(output_name+"/"+output_name+".svg").read()

@app.route('/residenceTime', methods= ['POST'])
def residenceTime_route():
    if request.method == "POST":
        #request_data = request.get_json(force=True)
        residence_time = []
        for res,value in lintools.topol_data.dict_of_plotted_res.items():
            residence_time.append({
                "resID":res[0]+str(res[1])+"_"+res[2],
                "resTime" : value,
                "resOnOff" : lintools.res_time.residues_ratio[res]
            })
        return jsonify(**{"residence": residence_time,"n_trajs": len(lintools.trajectory)})

@app.route('/HBonds', methods= ['POST'])
def HBonds_route():
    if request.method == "POST":
        #request_data = request.get_json(force=True)
        hbonds = []
        for bond,value in lintools.hbonds.hbonds_on_off.items():
            percentage =[]
            for traj in value.values():
                percentage.append(sum([x for x in traj])/float(len(traj))*100)
            hbonds.append({
                "bond":bond,
                "hbondTime" : value,
                "percentage": percentage
            })
        return jsonify(**{"hbonds": hbonds})

if __name__ == '__main__':
   app.run(debug = True)

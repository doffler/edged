import os
import json
import argparse
import subprocess


def main():
  FLAGS = argparser()
  with open(FLAGS.base_json) as fi :
    base_json = json.load(fi)

  if FLAGS.exec_file :
    exec_hash, exec_name, exec_dir = upload(FLAGS.exec_file)
    base_json['exec_file'] = dict()
    base_json['exec_file']['file_name'] = exec_name
    base_json['exec_file']['index'] = exec_hash
    if exec_dir :
      base_json['exec_file']['isdir'] = True

  if FLAGS.parameter_file :
    parameter_hash, parameter_name, parameter_dir = upload(FLAGS.parameter_file)
    base_json['parameters'] = dict()
    base_json['parameters']['file_name'] = parameter_name
    base_json['parameters']['index'] = parameter_hash
    if parameter_dir :
      base_json['parameters']['isdir'] = True

  if FLAGS.input_file :
    input_hash, index_name, input_dir = upload(FLAGS.input_file)
    base_json['input_data'] = dict()
    base_json['input_data']['file_name'] = index_name
    base_json['input_data']['index'] = input_hash

  with open(FLAGS.output, 'w') as fw :
    json.dump(base_json, fw, indent=2)


def argparser():
  parser = argparse.ArgumentParser()
  parser.add_argument(
    '--input_file',
    type=str,
    help='Input file for offloading computation'
  )
  parser.add_argument(
    '--exec_file',
    type=str,
    nargs='+',
    help='Code file for executing offloading request'
  )
  parser.add_argument(
    '--parameter_file',
    type=str,
    nargs='+',
    help='Parameters for the neural network model'
  )
  parser.add_argument(
    '--base_json',
    type=str,
    help='Base json file for the environment'
  )
  parser.add_argument(
    '--output',
    type=str,
    help='Output name for config json file'
  )

  FLAGS, unparsed = parser.parse_known_args()  
  if FLAGS.input_file :
    assert os.path.exists(FLAGS.input_file)
  if FLAGS.exec_file :
    for path in FLAGS.exec_file :
      assert os.path.exists(path)
  if FLAGS.parameter_file :
    for path in FLAGS.parameter_file :
      assert os.path.exists(path)
  if FLAGS.base_json : 
    assert os.path.exists(FLAGS.base_json)
  
  return FLAGS

def upload(path_name):
  dir_flag = False
  def upload_file(file_name):
    f_hash = subprocess.check_output(['ipfs', 'add', '{}'
          .format(file_name)]).decode('UTF-8')
    exec_hash = f_hash.split()[1]
    return exec_hash
  
  def upload_dir(dir_name):
    d_hash = subprocess.check_output(['ipfs', 'add', '-r', '{}'
           .format(dir_name)]).decode('UTF-8')
    dir_hash = d_hash.split('\n')    
    dir_hash = [line for line in dir_hash if 'added' in line]
    exec_hash = dir_hash[-1].split()[1]
    return exec_hash
  
  if isinstance(path_name, list) :
    upload_hash = []
    upload_name = []
    for path in path_name:
      isdir = os.path.isdir(path)
      if isdir :
        current_hash = upload_dir(path)
      else :
        current_hash = upload_file(path)
      upload_hash.append(current_hash)
      upload_name.append(os.path.basename(path))
    if len(path_name) == 1 and os.path.isdir(path_name[0]):
      dir_flag = True
  else :
    isdir = os.path.isdir(path_name)
    if isdir :
      upload_hash = upload_dir(path_name)
      dir_flag = True
    else :
      upload_hash = upload_file(path_name)
    upload_name = os.path.basename(path_name)
  return upload_hash, upload_name, dir_flag


if __name__ == "__main__":
  main()
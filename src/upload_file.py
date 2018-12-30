import os
import json
import argparse
import subprocess


def main():
  FLAGS = argparser()
  with open(FLAGS.base_json) as fi :
    base_json = json.loads(fi)

  if not base_json['exec_file'] :
    exec_hash = upload(FLAGS.exec_file, os.path.isdir(FLAGS.exec_file))
    base_json['exec_file'] = dict()
    base_json['exec_file']['file_name'] = os.path.basename(FLAGS.exec_file)
    base_json['exec_file']['index'] = exec_hash

  if not base_json['parameter_file'] :
    parameter_hash = upload(FLAGS.parameter_file, 
          os.path.isdir(FLAGS.parameter_file))
    base_json['parameters'] = dict()
    base_json['parameters']['file_name'] = os.path.basename(FLAGS.parameter_file)
    base_json['parameters']['index'] = parameter_hash

  input_hash = upload(FLAGS.input_file, os.path.isdir(FLAGS.input_file))
  base_json['input_data'] = dict()
  base_json['input_data']['file_name'] = os.path.basename(FLAGS.input_file)
  base_json['input_data']['index'] = input_hash

  with open(FLAGS.output, 'w') as fw :
    json.dump(base_json, fw)


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
    help='Code file for executing offloading request'
  )
  parser.add_argument(
    '--parameter_file',
    type=str,
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
    assert os.path.exists(FLAGS.exec_file)
  if FLAGS.parameter_file :
    assert os.path.exists(FLAGS.parameter_file)
  if FLAGS.base_json : 
    assert os.path.exists(FLAGS.base_json)
  if FLAGS.output : 
    assert os.path.exist(FLAGS.output)
  
  return FLAGS

def upload(path_name, isdir):

  def upload_file(file_name):
    f_hash = subprocess.check_output('ipfs add {}'
          .format(path_name)).decode('UTF-8')
    exec_hash = f_hash.split()[1]
    return exec_hash
  
  def upload_dir(dir_name):
    d_hash = subprocess.check_output('ipfs add -r {}'
           .format(dir_name)).decode('UTF-8')
    dir_hash = d_hash.split('\n')    
    dir_hash = [line for line in dir_hash if 'added' in line]
    exec_hash = dir_hash[-1].split()[1]
    return exec_hash
  
  if isdir :
    upload_hash = upload_dir(path_name)
  else :
    upload_hash = upload_file(path_name)
  return upload_hash


if __name__ == "__main__":
  main()
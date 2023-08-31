import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
from os import system
import re
from datetime import datetime
system("cls")

from flask import Flask, request, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/download', methods=['POST'])
def download_image():
    data = request.json
    image_url = data.get('url')
    print(image_url)
    final_url =  parseurl(image_url)
    print(f"final url = {final_url}")
    return final_url,200
    

def parseurl(page_url):
    body = requests.get(page_url) 
    if(body.status_code != 200):
        print("Entered URL is invalid or not working.")
    else:
        soup = BeautifulSoup(body.content, "html.parser") 
        print("Fetched content Sucessfull.")
        extract_url = (soup.find("video",class_="hwa kVc MIw L4E"))['src']
        convert_url = extract_url.replace("hls","720p").replace("m3u8","mp4")
        print("Downloading file now")
        return convert_url

if __name__ == '__main__':
    app.run()
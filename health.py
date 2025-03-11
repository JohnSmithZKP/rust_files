import requests
import sys


def main():

    args = sys.argv[1:]
    IP_PORT = args[0]
    CADDRESS = args[1]

    IP = 'http://' + IP_PORT


    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    data = '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}'


    try:
        response = requests.post(IP, headers=headers, data=data)

        print(response.text)

        no_peers = '"result":"0x0"'

        if no_peers in response.text:
            print("No peers yet")
            exit(1)
        else:

            headers = {
                'Content-Type': 'application/json',
            }
            
            json_data = {
                'jsonrpc': '2.0',
                'method': 'eth_syncing',
                'params': [],
                'id': 1,
            }

            response = requests.post(IP, headers=headers, json=json_data)
            print(response.text)


            syncing = '"result":false'
            if syncing not in response.text:
                print("Still syncing")
                exit(1)
            else:

                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }


                data = '{"jsonrpc":"2.0","method":"eth_getCode","params":["' + CADDRESS + '", "latest"],"id":53}'

                response = requests.post(IP, headers=headers, data=data)
                print(response.text)


                no_contract_deployed = '"result":"0x"'

                if no_contract_deployed in response.text:
                    print("Contract not deployed yet")
                    exit(1)


                exit(0)



    except requests.exceptions.RequestException:
        print("Connection Error")
        exit(1)





main()
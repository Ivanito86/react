<?php
/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
$scriptInvokedFromCli =
    isset($_SERVER['argv'][0]) && $_SERVER['argv'][0] === 'server.php';

if($scriptInvokedFromCli) {
    $port = getenv('PORT');
    if (empty($port)) {
        $port = "3000";
    }

    echo 'starting server on port '. $port . PHP_EOL;
    exec('php -S localhost:'. $port . ' -t public server.php');
} else {
    return routeRequest();
}

function routeRequest()
{
    $posts = file_get_contents('posts.json');
    $uri = $_SERVER['REQUEST_URI'];
    if ($uri == '/') {
        echo file_get_contents('./public/index.html');
    } elseif (preg_match('/\/api\/posts(\?.*)?/', $uri)) {
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $postsDecoded = json_decode($posts, true);
            $postsDecoded[] = [
                'id'      => round(microtime(true) * 1000),
                'title'  => $_POST['title'],
                'text'    => $_POST['text']
            ];
            $posts = json_encode($postsDecoded, JSON_PRETTY_PRINT);
            file_put_contents('posts.json', $posts);
        } else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $id = $_GET['postID'];
            $i=0;
            $postsDecoded = json_decode($posts,false);
            foreach ($postsDecoded as $element) {
                if($id == $element->id)
                {
                    unset($postsDecoded[$i]);
                    $postsDecoded = array_values($postsDecoded);

                }
                $i++;
            }
            $posts = json_encode($postsDecoded, JSON_PRETTY_PRINT);
            file_put_contents('posts.json', $posts);
        }
        header('Content-Type: application/json');
        header('Cache-Control: no-cache');
        header('Access-Control-Allow-Origin: *');
        echo $posts;
    } else {
        return false;
    }
}

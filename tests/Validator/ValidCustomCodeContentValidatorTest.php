<?php

namespace Capco\Tests\Validator;

use Capco\AppBundle\Validator\Constraints\ValidCustomCodeContent;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;

/**
 * @internal
 * @coversNothing
 */
class ValidCustomCodeContentValidatorTest extends TestCase
{
    /**
     * @dataProvider contents
     */
    public function testValidatesTheWholeDocument(?string $content, bool $valid): void
    {
        $violations = Validation::createValidator()->validate($content, new ValidCustomCodeContent());

        self::assertCount($valid ? 0 : 1, $violations);
    }

    public static function contents(): \Generator
    {
        yield 'null' => [null, true];
        yield 'empty' => ['', true];
        yield 'whitespace' => [" \n\t", true];
        yield 'comment' => ['<!-- custom code -->', true];
        yield 'allowed tags' => ["<!-- CSS -->\n<style>body { color: red; }</style>\n<script>if (1 < 2) alert('ok');</script><noscript><img src=tracking.gif></noscript>", true];
        yield 'structural markup inside script' => ['<script>const template = "<html><body>example<\/body><\/html>";</script>', true];
        yield 'forbidden root tag' => ['<img src=x onerror=alert(1)>', false];
        yield 'root text' => ['text<script>x</script>', false];
        yield 'multiple bodies' => ['</body><img src=x onerror=alert(1)><body><script>x</script>', false];
        yield 'element outside body' => ['</body><img src=x onerror=alert(1)>', false];
        yield 'text outside body' => ['</body>unexpected', false];
        yield 'head outside body' => ['</body><head><script>x</script></head>', false];
        yield 'multiple html wrappers' => ['</body></html><html><body><script>x</script></body></html>', false];
    }
}

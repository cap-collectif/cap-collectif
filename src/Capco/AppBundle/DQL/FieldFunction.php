<?php
// from Beberlei/DoctrineExtensions
namespace Capco\AppBundle\DQL;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\Lexer;

/**
 * @author Jeremy Hicks <jeremy.hicks@gmail.com>
 */
class FieldFunction extends FunctionNode
{
    private $field = null;

    private $values = [];

    public function parse(\Doctrine\ORM\Query\Parser $parser)
    {
        $parser->match(Lexer::T_IDENTIFIER);
        $parser->match(Lexer::T_OPEN_PARENTHESIS);

        // Do the field.
        $this->field = $parser->ArithmeticPrimary();

        // Add the strings to the values array. FIELD must
        // be used with at least 1 string not including the field.

        $lexer = $parser->getLexer();

        while (
            count($this->values) < 1 ||
            $lexer->lookahead['type'] != Lexer::T_CLOSE_PARENTHESIS
        ) {
            $parser->match(Lexer::T_COMMA);
            $this->values[] = $parser->ArithmeticPrimary();
        }

        $parser->match(Lexer::T_CLOSE_PARENTHESIS);
    }

    public function getSql(\Doctrine\ORM\Query\SqlWalker $sqlWalker)
    {
        $query = 'FIELD(';

        $query .= $this->field->dispatch($sqlWalker);

        $query .= ', ';

        foreach ($this->values as $i => $iValue) {
            if ($i > 0) {
                $query .= ', ';
            }

            $query .= $iValue->dispatch($sqlWalker);
        }

        $query .= ')';

        return $query;
    }
}

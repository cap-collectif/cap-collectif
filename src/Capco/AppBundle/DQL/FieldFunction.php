<?php

// from Beberlei/DoctrineExtensions

namespace Capco\AppBundle\DQL;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\Lexer;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\SqlWalker;

/**
 * @author Jeremy Hicks <jeremy.hicks@gmail.com>
 */
class FieldFunction extends FunctionNode
{
    private $field;

    private $values = [];

    public function parse(Parser $parser)
    {
        $parser->match(Lexer::T_IDENTIFIER);
        $parser->match(Lexer::T_OPEN_PARENTHESIS);

        // Do the field.
        $this->field = $parser->ArithmeticPrimary();

        // Add the strings to the values array. FIELD must
        // be used with at least 1 string not including the field.

        $lexer = $parser->getLexer();

        while (
            \count($this->values) < 1
            || Lexer::T_CLOSE_PARENTHESIS != $lexer->lookahead['type']
        ) {
            $parser->match(Lexer::T_COMMA);
            $this->values[] = $parser->ArithmeticPrimary();
        }

        $parser->match(Lexer::T_CLOSE_PARENTHESIS);
    }

    public function getSql(SqlWalker $sqlWalker)
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

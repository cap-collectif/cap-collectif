<?php

namespace Capco\AppBundle\DQL;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\AST\Subselect;
use Doctrine\ORM\Query\Lexer;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\SqlWalker;

class FirstFunction extends FunctionNode
{
    private Subselect $subSelect;

    public function getSql(SqlWalker $sqlWalker): string
    {
        return '(' . $this->subSelect->dispatch($sqlWalker) . ' LIMIT 1)';
    }

    public function parse(Parser $parser): void
    {
        $parser->match(Lexer::T_IDENTIFIER);
        $parser->match(Lexer::T_OPEN_PARENTHESIS);
        $this->subSelect = $parser->Subselect();
        $parser->match(Lexer::T_CLOSE_PARENTHESIS);
    }
}

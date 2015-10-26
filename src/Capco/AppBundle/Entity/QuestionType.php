<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * QuestionType
 *
 * @ORM\Table(name="question_type")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\QuestionTypeRepository")
 */
class QuestionType
{

    const QUESTION_TYPE_SIMPLE_TEXT     = 0;
    const QUESTION_TYPE_MULTILINE_TEXT  = 1;
    const QUESTION_TYPE_FILE            = 2;
    const QUESTION_TYPE_ADDRESS         = 3;

    public static $questionTypes = [
        self::QUESTION_TYPE_SIMPLE_TEXT    => 'question_type.types.simple_text',
        self::QUESTION_TYPE_MULTILINE_TEXT => 'question_type.types.multiline_test',
        self::QUESTION_TYPE_FILE           => 'question_type.types.file',
        self::QUESTION_TYPE_ADDRESS        => 'question_type.types.address',
    ];

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="type", type="integer")
     */
    private $type;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set type
     *
     * @param string $type
     * @return QuestionType
     */
    public function setType($type)
    {
        $this->type = $type;
        return $this;
    }

    /**
     * Get type
     *
     * @return string 
     */
    public function getType()
    {
        return $this->type;
    }
}

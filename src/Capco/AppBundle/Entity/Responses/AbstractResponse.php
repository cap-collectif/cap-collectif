<?php

namespace Capco\AppBundle\Entity\Responses;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Response.
 *
 * @ORM\Table(name="response")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractResponseRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\HasRequiredNumberOfChoices()
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "response_type", type = "string")
 * @ORM\DiscriminatorMap({
 *      "value"  = "ValueResponse",
 *      "media"  = "MediaResponse",
 * })
 */
abstract class AbstractResponse
{
    use IdTrait;
    use TimestampableTrait;

    const TYPE_FIELD_NAME = 'type';

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"value"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @var Proposal
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="responses", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $proposal;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="responses", cascade={"persist"})
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $user;

    /**
     * @var Reply
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Reply", inversedBy="responses", cascade={"persist"})
     * @ORM\JoinColumn(name="reply_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $reply;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalEvaluation", inversedBy="responses", cascade={"persist"})
     * @ORM\JoinColumn(name="evaluation_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $proposalEvaluation;

    /**
     * @Assert\NotNull()
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questions\AbstractQuestion", inversedBy="responses",
     *                                                                                  cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="question_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private $question;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->updatedAt = new \Datetime();
    }

    abstract public function getType();

    /**
     * @return Proposal
     */
    public function getProposal()
    {
        return $this->proposal;
    }

    /**
     * @param Proposal $proposal
     *
     * @return $this
     */
    public function setProposal(Proposal $proposal)
    {
        $this->proposal = $proposal;

        return $this;
    }

    public function setUser(User $user)
    {
        $this->user = $user;

        return $this;
    }

    public function getUser()
    {
        return $this->user;
    }

    /**
     * @return AbstractQuestion
     */
    public function getQuestion()
    {
        return $this->question;
    }

    /**
     * @param AbstractQuestion $question
     *
     * @return $this
     */
    public function setQuestion(AbstractQuestion $question)
    {
        $this->question = $question;

        return $this;
    }

    /**
     * @return Reply
     */
    public function getReply()
    {
        return $this->reply;
    }

    /**
     * @param Reply $reply
     *
     * @return $this
     */
    public function setReply($reply)
    {
        $this->reply = $reply;

        return $this;
    }

    public function getProposalEvaluation()
    {
        return $this->proposalEvaluation;
    }

    public function setProposalEvaluation(ProposalEvaluation $proposalEvaluation = null): self
    {
        $this->proposalEvaluation = $proposalEvaluation;

        return $this;
    }

    /**
     * @ORM\PostUpdate()
     */
    public function updateProposalTimestamp()
    {
        if ($this->getUpdatedAt() && $this->getProposal()) {
            $this->getProposal()->setUpdatedAt(new \DateTime());
        }
    }
}

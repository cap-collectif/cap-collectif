<?php echo "<?php\n"; ?>

<?php $repositoryName = $command_entity_name . 'Repository'; ?>
<?php $notifierName = $command_entity_name . 'Notifier'; ?>
<?php $varRepositoryName = lcfirst($repositoryName); ?>
<?php $varNotifierName = lcfirst($notifierName); ?>
<?php $varEntityName = lcfirst((string) $command_entity_name); ?>

namespace Capco\AppBundle\Processor<?php if (
    isset($command_entity_name)
) { ?>\<?php echo $command_entity_name; } ?>;

use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;
use Capco\AppBundle\Repository\<?php echo $repositoryName; ?>;
use Capco\AppBundle\Notifier\<?php echo $notifierName; ?>;

class <?php echo $command_class_name; ?> implements ProcessorInterface
{

    private $<?php echo $varRepositoryName; ?>;
    private $<?php echo $varNotifierName; ?>;

    public function __construct(<?php echo $repositoryName .
        ' $' .
        $varRepositoryName; ?>, <?php echo $notifierName . ' $' . $varNotifierName; ?>)
    {
        $this-><?php echo $varRepositoryName; ?> = $<?php echo $varRepositoryName; ?>;
        $this-><?php echo $varNotifierName; ?> = $<?php echo $varNotifierName; ?>;
    }

    public function process(Message $message, array $options)
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['<?php echo $varEntityName; ?>Id'];
        $<?php echo $varEntityName; ?> = $this-><?php echo $varRepositoryName; ?>->find($id);
        if (!$<?php echo $varEntityName; ?>) {
            throw new \RuntimeException('Unable to find <?php echo $varEntityName; ?> with id : ' . $id);
        }
        // Use your notifier here
    }
}

<script lang="ts">
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

{#if data?.email}
	<p>Logged as {data.email}</p>
{:else}
	{#if !form?.codeSent}
		<form action="?/sendCode" method="post">
			<label>
				Email:
				<input type="email" name="email" />
			</label>
			<button type="submit">Send code</button>
		</form>
	{/if}

	{#if form?.codeSent && !data?.email}
		<form action="?/login" method="post">
			<label>
				Code:
				<input type="text" name="code" />
			</label>
			<button type="submit">Login</button>
		</form>
	{/if}
{/if}

<form method="POST" action="?/auctions">
	<label>
		Miasto:
		<input type="text" name="city" />
	</label>

	<button type="submit">Szukaj</button>
</form>

{#if form?.auctions}
	<h1>Lista ofert</h1>
	<table class="table-auto">
		<thead>
			<tr>
				<th>Data licytacji</th>
				<th>Kategoria</th>
				<th>Nazwa</th>
				<th>Miasto</th>
				<th>Cena wywołania</th>
				<th>Link do aukcji</th>
				<th>Link do szczegółów</th>
			</tr>
		</thead>
		<tbody>
			{#each form.auctions as auction}
				<tr>
					<td>{auction.startDate}</td>
					<td>{auction.category}</td>
					<td>{auction.name}</td>
					<td>{auction.city}</td>
					<td>{auction.price}</td>
					<td><a href={auction.auctionUrl} target="_blank">Zobacz aukcję</a></td>
					<td><a href={auction.detailsUrl} target="_blank">Szczegóły</a></td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}